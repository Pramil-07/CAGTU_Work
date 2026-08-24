import { useState, useEffect } from 'react';
import { Modal, Button, TextInput, Textarea, Select, Switch, Group, Text, useMantineTheme, Flex } from '@mantine/core';
import { useForm } from '@mantine/form';
import { axiosClient } from '@/utils/axiosClient';
import { toast } from '@/components/common/Toast';
import urls from '@/constants/urls';
import { modals } from '@mantine/modals';

// Interfaces (matching CalendarApp)
export enum EventType {
  Personal = 'personal',
  Festival = 'festival',
  Holiday = 'holiday',
  Reminder = 'reminder',
  Meeting = 'meeting',
  Appointment = 'appointment',
  Travel = 'travel',
  Weekend = 'weekend',
  Event = 'event',
}

export enum RepeatChoice {
  None = 'none',
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
  Yearly = 'yearly',
  Custom = 'custom',
}

export interface EventTimeSlot {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  date: string;
  start_time: string;
  end_time: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  event_type: EventType;
  repeat: RepeatChoice;
  color_tag: string;
  visibility: boolean;
  location: string;
  user: string;
  event_time_slots: EventTimeSlot[];
  calendarId?: string;
}

interface CalendarEventInteractiveProps {
  selectedDate: string | null;
  opened: boolean;
  setOpened: (opened: boolean) => void;
  onEventAdded: (event: CalendarEvent) => void;
  onEventUpdated: (event: CalendarEvent) => void;
  onEventDeleted: (eventId: number) => void;
  event: CalendarEvent | null;
  currentUserId: string;
}

// TimeSelect component for 15-minute interval time selection
interface TimeSelectProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string;
  required?: boolean;
}

function TimeSelect({ label, value, onChange, error, required }: TimeSelectProps) {
  // Generate time slots at 15-minute intervals (00:00 to 23:45)
  const generateTimeSlots = () => {
    const slots: { value: string; label: string }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ value: time, label: time }); // Use 24-hour format for simplicity
      }
    }
    return slots;
  };

  return (
    <Select
      label={label}
      placeholder="Select time"
      data={generateTimeSlots()}
      value={value}
      onChange={onChange}
      searchable
      clearable
      required={required}
      error={error}
      mb="sm"
    />
  );
}

export function CalendarEventInteractive({
  selectedDate,
  opened,
  setOpened,
  onEventAdded,
  onEventUpdated,
  onEventDeleted,
  event,
  currentUserId,
}: CalendarEventInteractiveProps) {
  const theme = useMantineTheme();
  const isEditing = !!event;

  const form = useForm<CalendarEvent>({
    initialValues: {
      id: event?.id || 0,
      title: event?.title || '',
      description: event?.description || '',
      start_date: event?.start_date || selectedDate || new Date().toISOString().split('T')[0],
      end_date: event?.end_date || new Date().toISOString().split('T')[0],
      event_type: event?.event_type || EventType.Event,
      repeat: event?.repeat || RepeatChoice.None,
      color_tag: event?.color_tag || '#10b981',
      visibility: event?.visibility ?? true,
      location: event?.location || '',
      user: event?.user || currentUserId,
      event_time_slots: event?.event_time_slots || [{
        id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        date: selectedDate || new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
      }],
      calendarId: event?.calendarId || 'custom',
    },
    validate: {
      title: (value) => (value.trim().length > 0 ? null : 'Title is required'),
      start_date: (value) => (value ? null : 'Start date is required'),
      end_date: (value, values) =>
        value && new Date(value) >= new Date(values.start_date)
          ? null
          : 'End date must be on or after start date',
      event_time_slots: {
        start_time: (value) => (value ? null : 'Start time is required'),
        end_time: (value, values, path) => {
          const slotIndex = parseInt(path.split('.')[1]);
          const startTime = values.event_time_slots[slotIndex].start_time;
          if (!value || !startTime) return 'End time is required';
          return value > startTime ? null : 'End time must be after start time';
        },
      },
    },
  });

  useEffect(() => {
    if (event && isEditing) {
      form.setValues(event);
    } else {
      form.reset();
      form.setFieldValue('start_date', selectedDate || new Date().toISOString().split('T')[0]);
      form.setFieldValue('end_date', selectedDate || new Date().toISOString().split('T')[0]);
      form.setFieldValue('user', currentUserId);
      form.setFieldValue('event_time_slots', [{
        id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        date: selectedDate || new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
      }]);
    }
  }, [event, selectedDate, currentUserId, isEditing]);

  const handleSubmit = async (values: CalendarEvent) => {
    try {
      if (isEditing) {
        // Update existing event via PUT
        const response = await axiosClient.put(`memo/${values.id}/`, values);
        const updatedEvent = response.data; // Adjust based on API response structure
        onEventUpdated(updatedEvent);
        toast.success('Event updated successfully');
      } else {
        // Create new event via POST
        const newEvent = {
          ...values,
          id: 0, // Let backend assign ID
          user: currentUserId,
          event_time_slots: values.event_time_slots.map(slot => ({
            ...slot,
            id: 0, // Let backend assign ID
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
          })),
        };
        const response = await axiosClient.post('memo/', newEvent);
        const createdEvent = response.data; // Adjust based on API response structure
        onEventAdded(createdEvent);
        toast.success('Event created successfully');
      }
      setOpened(false);
      form.reset();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(isEditing ? 'Failed to update event' : 'Failed to create event');
    }
  };

  const handleDelete = () => {
    if (!event?.id) return;

    // Open confirmation modal for deletion
    modals.openConfirmModal({
      title: 'Delete Event',
      children: (
        <Text size="sm">
          Are you sure you want to delete this event? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onCancel: () => console.log('Deletion canceled'),
      onConfirm: async () => {
        try {
          await axiosClient.delete(`memo/${event.id}`);
          onEventDeleted(event.id); // Notify parent to remove event
          setOpened(false); // Close the event modal
          toast.success('Event deleted successfully');
          form.reset();
        } catch (error) {
          console.error('Error deleting event:', error);
          toast.error('Failed to delete event');
        }
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={isEditing ? 'Edit Event' : 'Add Event'}
      size="l"
      overlayProps={{
        color: theme.colors.gray[2],
        opacity: 0.55,
        blur: 3,
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Title"
          placeholder="Event title"
          required
          {...form.getInputProps('title')}
          mb="sm"
        />
        <Textarea
        
          label="Description"
          placeholder="Event description"
          {...form.getInputProps('description')}
          mb="sm"
        />
        <TextInput
          label="Location"
          placeholder="Event location"
          {...form.getInputProps('location')}
          mb="sm"
        />
        <Flex>

        
        <TextInput
        
          label="Start Date"
          type="date"
          required
          {...form.getInputProps('start_date')}
          mb="sm"
        />
        <TextInput
          label="End Date"
          type="date"
          required
          {...form.getInputProps('end_date')}
          mb="sm"
        />
        </Flex>
        <Flex gap={50}>

        <TimeSelect
          label="Start Time"
          value={form.values.event_time_slots[0].start_time}
          onChange={(value) => form.setFieldValue('event_time_slots.0.start_time', value )}
          // error={form.errors['event_time_slots.0.start_time']}
          required
          />
        <TimeSelect
          label="End Time"
          value={form.values.event_time_slots[0].end_time}
          onChange={(value) => form.setFieldValue('event_time_slots.0.end_time', value )}
          // error={form.errors['event_time_slots.0.end_time']}
          required
          />
          </Flex>
          <Flex>

        <Select
          label="Event Type"
          data={Object.values(EventType).map((type) => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
          }))}
          required
          {...form.getInputProps('event_type')}
          mb="sm"
          />
        <Select
          label="Repeat"
          data={Object.values(RepeatChoice).map((choice) => ({
            value: choice,
            label: choice.charAt(0).toUpperCase() + choice.slice(1),
          }))}
          required
          {...form.getInputProps('repeat')}
          mb="sm"
          />
          </Flex>
        {/* <TextInput
          label="Color Tag"
          type="color"
          {...form.getInputProps('color_tag')}
          mb="sm"
        /> */}
        <Switch
          label="Public Event"
          checked={form.values.visibility}
          onChange={(e) => form.setFieldValue('visibility', e.currentTarget.checked)}
          mb="sm"
        />
        <Group position="right" mt="md">
          {/* {isEditing && (
            <Button color="red" variant="outline" onClick={handleDelete}>
              Delete
            </Button>
          )} */}
          <Button type="submit">
            {isEditing ? 'Update Event' : 'Create Event'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}