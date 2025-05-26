#[starknet::contract]
mod StarkversePoints {
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use openzeppelin::token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin::access::ownable::{OwnableComponent};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // ERC20 Mixin
    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    // Ownable Mixin
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        // Track user registration for initial point distribution
        user_registered: LegacyMap<ContractAddress, bool>,
        // Event participation tracking
        event_participants: LegacyMap<u256, LegacyMap<ContractAddress, bool>>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        UserRegistered: UserRegistered,
        PointsAwarded: PointsAwarded,
        PointsSpent: PointsSpent,
    }

    #[derive(Drop, starknet::Event)]
    struct UserRegistered {
        user: ContractAddress,
        initial_points: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct PointsAwarded {
        user: ContractAddress,
        amount: u256,
        reason: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct PointsSpent {
        user: ContractAddress,
        amount: u256,
        purpose: felt252,
    }

    mod Errors {
        const ALREADY_REGISTERED: felt252 = 'User already registered';
        const NOT_REGISTERED: felt252 = 'User not registered';
        const INSUFFICIENT_BALANCE: felt252 = 'Insufficient balance';
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        // Initialize ERC20 with name, symbol, and decimals
        self.erc20.initializer("Starkverse Points", "SP", 18);
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl StarkversePointsImpl of super::IStarkversePoints<ContractState> {
        /// Register a new user and give them initial points (1000 SP)
        fn register_user(ref self: ContractState) {
            let caller = get_caller_address();
            
            // Check if user is already registered
            assert(!self.user_registered.read(caller), Errors::ALREADY_REGISTERED);
            
            // Mark user as registered
            self.user_registered.write(caller, true);
            
            // Mint initial 1000 SP tokens (1000 * 10^18)
            let initial_amount = 1000_u256 * 1000000000000000000_u256;
            self.erc20.mint(caller, initial_amount);
            
            // Emit event
            self.emit(UserRegistered { user: caller, initial_points: initial_amount });
        }

        /// Award points to a user (only owner can call this)
        fn award_points(ref self: ContractState, user: ContractAddress, amount: u256, reason: felt252) {
            self.ownable.assert_only_owner();
            
            // Mint new tokens
            self.erc20.mint(user, amount);
            
            // Emit event
            self.emit(PointsAwarded { user, amount, reason });
        }

        /// Spend points for raffle entry or other purposes
        fn spend_points(ref self: ContractState, amount: u256, purpose: felt252) {
            let caller = get_caller_address();
            
            // Check if user has enough balance
            let balance = self.erc20.balance_of(caller);
            assert(balance >= amount, Errors::INSUFFICIENT_BALANCE);
            
            // Burn the tokens
            self.erc20.burn(caller, amount);
            
            // Emit event
            self.emit(PointsSpent { user: caller, amount, purpose });
        }

        /// Check if user is registered
        fn is_user_registered(self: @ContractState, user: ContractAddress) -> bool {
            self.user_registered.read(user)
        }

        /// Get user's point balance
        fn get_balance(self: @ContractState, user: ContractAddress) -> u256 {
            self.erc20.balance_of(user)
        }

        /// Mark user as participant in an event
        fn mark_event_participation(ref self: ContractState, event_id: u256, user: ContractAddress) {
            self.ownable.assert_only_owner();
            self.event_participants.write(event_id, user, true);
        }

        /// Check if user participated in an event
        fn has_participated_in_event(self: @ContractState, event_id: u256, user: ContractAddress) -> bool {
            self.event_participants.read(event_id).read(user)
        }
    }
}

#[starknet::interface]
trait IStarkversePoints<TContractState> {
    fn register_user(ref self: TContractState);
    fn award_points(ref self: TContractState, user: ContractAddress, amount: u256, reason: felt252);
    fn spend_points(ref self: TContractState, amount: u256, purpose: felt252);
    fn is_user_registered(self: @TContractState, user: ContractAddress) -> bool;
    fn get_balance(self: @TContractState, user: ContractAddress) -> u256;
    fn mark_event_participation(ref self: TContractState, event_id: u256, user: ContractAddress);
    fn has_participated_in_event(self: @TContractState, event_id: u256, user: ContractAddress) -> bool;
}