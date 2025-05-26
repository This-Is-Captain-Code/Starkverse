import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Plus } from "lucide-react";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description too long"),
  platform: z.enum(["viveverse", "meta-horizon"], {
    required_error: "Please select a platform",
  }),
  worldUrl: z.string().url("Please enter a valid URL"),
  entryPoints: z.number().min(100, "Minimum 100 SP").max(10000, "Maximum 10,000 SP"),
  maxWinners: z.number().min(1, "At least 1 winner required").max(1000, "Maximum 1,000 winners"),
  eventDate: z.string().min(1, "Event date is required"),
});

type CreateEventData = z.infer<typeof createEventSchema>;

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateEventModal({ open, onOpenChange }: CreateEventModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateEventData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      platform: undefined,
      worldUrl: "",
      entryPoints: 500,
      maxWinners: 50,
      eventDate: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: CreateEventData) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event Created Successfully!",
        description: "Your virtual event has been created and is now live for raffle entries.",
      });
      
      form.reset();
      onOpenChange(false);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/my-events"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Event",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateEventData) => {
    createEventMutation.mutate(data);
  };

  // Get minimum date (today)
  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const minDateString = minDate.toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-surface border-primary/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create Virtual Event
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Host your own metaverse event and let users enter raffles to win access
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 font-semibold">Event Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your event title"
                      className="bg-dark-card border-primary/20 text-white placeholder-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your virtual event experience"
                      className="bg-dark-card border-primary/20 text-white placeholder-gray-400 resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-semibold">Platform</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-dark-card border-primary/20 text-white">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="viveverse">Viveverse</SelectItem>
                        <SelectItem value="meta-horizon">Meta Horizon Worlds</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-semibold">Entry Cost (SP)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={100}
                        max={10000}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-dark-card border-primary/20 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="worldUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 font-semibold">Virtual World URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://..."
                      className="bg-dark-card border-primary/20 text-white placeholder-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-semibold">Event Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        min={minDateString}
                        className="bg-dark-card border-primary/20 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxWinners"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 font-semibold">Max Winners</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={1000}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-dark-card border-primary/20 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={createEventMutation.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80"
              >
                {createEventMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-600 hover:border-gray-500"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
