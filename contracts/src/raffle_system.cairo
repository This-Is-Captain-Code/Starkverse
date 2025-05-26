#[starknet::contract]
mod StarkverseRaffle {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp, get_block_number};
    use openzeppelin::access::ownable::{OwnableComponent};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        // Event storage
        events: LegacyMap<u256, Event>,
        event_count: u256,
        // Raffle storage
        raffles: LegacyMap<u256, Raffle>,
        raffle_count: u256,
        // Raffle entries
        raffle_entries: LegacyMap<u256, LegacyMap<ContractAddress, u256>>, // raffle_id -> user -> entry_count
        raffle_total_entries: LegacyMap<u256, u256>,
        raffle_participants: LegacyMap<u256, LegacyMap<u256, ContractAddress>>, // raffle_id -> index -> user
        raffle_participant_count: LegacyMap<u256, u256>,
        // Winners
        raffle_winners: LegacyMap<u256, LegacyMap<u256, ContractAddress>>, // raffle_id -> index -> winner
        raffle_winner_count: LegacyMap<u256, u256>,
        // Points token contract
        points_token: ContractAddress,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct Event {
        id: u256,
        title: felt252,
        description: felt252,
        creator: ContractAddress,
        platform: felt252, // 'viveverse' or 'meta_horizon'
        world_url: felt252,
        entry_points: u256,
        max_winners: u256,
        event_date: u64,
        status: felt252, // 'upcoming', 'live', 'ended'
        created_at: u64,
    }

    #[derive(Drop, Serde, starknet::Store)]
    struct Raffle {
        id: u256,
        event_id: u256,
        status: felt252, // 'active', 'ended'
        end_time: u64,
        created_at: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        EventCreated: EventCreated,
        RaffleCreated: RaffleCreated,
        RaffleEntry: RaffleEntry,
        RaffleEnded: RaffleEnded,
        WinnersSelected: WinnersSelected,
    }

    #[derive(Drop, starknet::Event)]
    struct EventCreated {
        event_id: u256,
        creator: ContractAddress,
        title: felt252,
        entry_points: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RaffleCreated {
        raffle_id: u256,
        event_id: u256,
        end_time: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct RaffleEntry {
        raffle_id: u256,
        user: ContractAddress,
        entry_count: u256,
        total_entries: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct RaffleEnded {
        raffle_id: u256,
        total_entries: u256,
        participant_count: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct WinnersSelected {
        raffle_id: u256,
        winners: Span<ContractAddress>,
    }

    mod Errors {
        const EVENT_NOT_FOUND: felt252 = 'Event not found';
        const RAFFLE_NOT_FOUND: felt252 = 'Raffle not found';
        const RAFFLE_ENDED: felt252 = 'Raffle has ended';
        const RAFFLE_ACTIVE: felt252 = 'Raffle still active';
        const INSUFFICIENT_POINTS: felt252 = 'Insufficient points';
        const NO_PARTICIPANTS: felt252 = 'No participants';
        const ALREADY_ENDED: felt252 = 'Already ended';
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, points_token: ContractAddress) {
        self.ownable.initializer(owner);
        self.points_token.write(points_token);
        self.event_count.write(0);
        self.raffle_count.write(0);
    }

    #[abi(embed_v0)]
    impl StarkverseRaffleImpl of super::IStarkverseRaffle<ContractState> {
        /// Create a new virtual event
        fn create_event(
            ref self: ContractState,
            title: felt252,
            description: felt252,
            platform: felt252,
            world_url: felt252,
            entry_points: u256,
            max_winners: u256,
            event_date: u64
        ) -> u256 {
            let caller = get_caller_address();
            let event_id = self.event_count.read() + 1;
            self.event_count.write(event_id);

            let event = Event {
                id: event_id,
                title,
                description,
                creator: caller,
                platform,
                world_url,
                entry_points,
                max_winners,
                event_date,
                status: 'upcoming',
                created_at: get_block_timestamp(),
            };

            self.events.write(event_id, event);

            // Create associated raffle (ends 1 hour before event)
            let raffle_end_time = if event_date > 3600 { event_date - 3600 } else { event_date };
            let raffle_id = self._create_raffle(event_id, raffle_end_time);

            self.emit(EventCreated { event_id, creator: caller, title, entry_points });

            event_id
        }

        /// Enter a raffle by spending points
        fn enter_raffle(ref self: ContractState, raffle_id: u256, entries: u256) {
            let caller = get_caller_address();
            
            // Check if raffle exists and is active
            let raffle = self.raffles.read(raffle_id);
            assert(raffle.id != 0, Errors::RAFFLE_NOT_FOUND);
            assert(raffle.status == 'active', Errors::RAFFLE_ENDED);
            assert(get_block_timestamp() < raffle.end_time, Errors::RAFFLE_ENDED);

            // Get event details for entry cost
            let event = self.events.read(raffle.event_id);
            let total_cost = event.entry_points * entries;

            // Spend points through the points token contract
            let points_token = self.points_token.read();
            IStarkversePointsDispatcher { contract_address: points_token }
                .spend_points(total_cost, 'raffle_entry');

            // Add entries
            let current_entries = self.raffle_entries.read(raffle_id).read(caller);
            let new_total = current_entries + entries;
            self.raffle_entries.write(raffle_id, caller, new_total);

            // Update total entries
            let total_entries = self.raffle_total_entries.read(raffle_id) + entries;
            self.raffle_total_entries.write(raffle_id, total_entries);

            // Add to participants if first entry
            if current_entries == 0 {
                let participant_count = self.raffle_participant_count.read(raffle_id);
                self.raffle_participants.write(raffle_id, participant_count, caller);
                self.raffle_participant_count.write(raffle_id, participant_count + 1);
            }

            self.emit(RaffleEntry { raffle_id, user: caller, entry_count: new_total, total_entries });
        }

        /// End a raffle and select winners (only owner or when time expires)
        fn end_raffle(ref self: ContractState, raffle_id: u256) -> Span<ContractAddress> {
            let raffle = self.raffles.read(raffle_id);
            assert(raffle.id != 0, Errors::RAFFLE_NOT_FOUND);
            assert(raffle.status == 'active', Errors::ALREADY_ENDED);

            let caller = get_caller_address();
            let is_owner = caller == self.ownable.owner();
            let time_expired = get_block_timestamp() >= raffle.end_time;
            
            assert(is_owner || time_expired, 'Not authorized');

            // Update raffle status
            let mut updated_raffle = raffle;
            updated_raffle.status = 'ended';
            self.raffles.write(raffle_id, updated_raffle);

            let participant_count = self.raffle_participant_count.read(raffle_id);
            let total_entries = self.raffle_total_entries.read(raffle_id);

            self.emit(RaffleEnded { raffle_id, total_entries, participant_count });

            if participant_count == 0 {
                let empty_winners: Array<ContractAddress> = array![];
                return empty_winners.span();
            }

            // Select winners using verifiable randomness
            let event = self.events.read(raffle.event_id);
            let winners = self._select_winners(raffle_id, event.max_winners);

            // Store winners
            let mut i = 0;
            loop {
                if i >= winners.len() {
                    break;
                }
                self.raffle_winners.write(raffle_id, i.into(), *winners.at(i));
                i += 1;
            };
            self.raffle_winner_count.write(raffle_id, winners.len().into());

            self.emit(WinnersSelected { raffle_id, winners });

            winners
        }

        /// Get event details
        fn get_event(self: @ContractState, event_id: u256) -> Event {
            self.events.read(event_id)
        }

        /// Get raffle details
        fn get_raffle(self: @ContractState, raffle_id: u256) -> Raffle {
            self.raffles.read(raffle_id)
        }

        /// Get user's entries for a raffle
        fn get_user_entries(self: @ContractState, raffle_id: u256, user: ContractAddress) -> u256 {
            self.raffle_entries.read(raffle_id).read(user)
        }

        /// Get total entries for a raffle
        fn get_total_entries(self: @ContractState, raffle_id: u256) -> u256 {
            self.raffle_total_entries.read(raffle_id)
        }

        /// Get raffle winners
        fn get_raffle_winners(self: @ContractState, raffle_id: u256) -> Array<ContractAddress> {
            let winner_count = self.raffle_winner_count.read(raffle_id);
            let mut winners = array![];
            let mut i = 0;
            
            loop {
                if i >= winner_count {
                    break;
                }
                let winner = self.raffle_winners.read(raffle_id).read(i);
                winners.append(winner);
                i += 1;
            };

            winners
        }

        /// Get event count
        fn get_event_count(self: @ContractState) -> u256 {
            self.event_count.read()
        }

        /// Get raffle count
        fn get_raffle_count(self: @ContractState) -> u256 {
            self.raffle_count.read()
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Create a raffle for an event
        fn _create_raffle(ref self: ContractState, event_id: u256, end_time: u64) -> u256 {
            let raffle_id = self.raffle_count.read() + 1;
            self.raffle_count.write(raffle_id);

            let raffle = Raffle {
                id: raffle_id,
                event_id,
                status: 'active',
                end_time,
                created_at: get_block_timestamp(),
            };

            self.raffles.write(raffle_id, raffle);
            self.emit(RaffleCreated { raffle_id, event_id, end_time });

            raffle_id
        }

        /// Select winners using verifiable randomness
        fn _select_winners(self: @ContractState, raffle_id: u256, max_winners: u256) -> Array<ContractAddress> {
            let participant_count = self.raffle_participant_count.read(raffle_id);
            let total_entries = self.raffle_total_entries.read(raffle_id);
            
            if participant_count == 0 {
                return array![];
            }

            let actual_winner_count = if max_winners > participant_count { participant_count } else { max_winners };
            let mut winners = array![];
            let mut used_addresses: Array<ContractAddress> = array![];

            // Use block hash and timestamp for randomness
            let block_number = get_block_number();
            let timestamp = get_block_timestamp();
            let seed = block_number.into() + timestamp.into() + raffle_id;

            let mut i = 0;
            loop {
                if i >= actual_winner_count {
                    break;
                }

                // Generate pseudo-random number
                let random_seed = seed + i.into();
                let random_entry = random_seed % total_entries;

                // Find which participant this entry belongs to
                let mut current_count = 0;
                let mut j = 0;
                let mut selected_user: ContractAddress = 0.try_into().unwrap();

                loop {
                    if j >= participant_count {
                        break;
                    }
                    
                    let participant = self.raffle_participants.read(raffle_id).read(j);
                    let user_entries = self.raffle_entries.read(raffle_id).read(participant);
                    
                    if random_entry < current_count + user_entries {
                        selected_user = participant;
                        break;
                    }
                    
                    current_count += user_entries;
                    j += 1;
                };

                // Check if this user was already selected
                let mut already_selected = false;
                let mut k = 0;
                loop {
                    if k >= used_addresses.len() {
                        break;
                    }
                    if *used_addresses.at(k) == selected_user {
                        already_selected = true;
                        break;
                    }
                    k += 1;
                };

                if !already_selected {
                    winners.append(selected_user);
                    used_addresses.append(selected_user);
                } else {
                    // If already selected, skip this iteration but don't increment counter
                    continue;
                }

                i += 1;
            };

            winners
        }
    }
}

#[starknet::interface]
trait IStarkverseRaffle<TContractState> {
    fn create_event(
        ref self: TContractState,
        title: felt252,
        description: felt252,
        platform: felt252,
        world_url: felt252,
        entry_points: u256,
        max_winners: u256,
        event_date: u64
    ) -> u256;
    fn enter_raffle(ref self: TContractState, raffle_id: u256, entries: u256);
    fn end_raffle(ref self: TContractState, raffle_id: u256) -> Span<ContractAddress>;
    fn get_event(self: @TContractState, event_id: u256) -> StarkverseRaffle::Event;
    fn get_raffle(self: @TContractState, raffle_id: u256) -> StarkverseRaffle::Raffle;
    fn get_user_entries(self: @TContractState, raffle_id: u256, user: ContractAddress) -> u256;
    fn get_total_entries(self: @TContractState, raffle_id: u256) -> u256;
    fn get_raffle_winners(self: @TContractState, raffle_id: u256) -> Array<ContractAddress>;
    fn get_event_count(self: @TContractState) -> u256;
    fn get_raffle_count(self: @TContractState) -> u256;
}

// Import the points token interface
#[starknet::interface]
trait IStarkversePoints<TContractState> {
    fn spend_points(ref self: TContractState, amount: u256, purpose: felt252);
}