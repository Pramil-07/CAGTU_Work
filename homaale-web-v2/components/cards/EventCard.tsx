import { useUser } from '@/hooks/useUser';
import { isLoggedIn, useDark } from '@/utils/helpers';
import { Card, Badge, Text, Group, Box, Button, Flex, Tooltip, useMantineTheme } from '@mantine/core';
import dayjs from 'dayjs';

// Define the interfaces (matching CalendarApp)
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
  created_by?:string
  next_occurence?:{
    start_date:string,
    end_date:string,
  }
}

interface EventCardProps {
  event: CalendarEvent;
  handleDelete?: (eventId: number) => void;
  handleUpdate?: (event: CalendarEvent) => void;
  profileId: string | undefined;
}

export function EventCard({ event, handleDelete, handleUpdate, profileId }: EventCardProps): JSX.Element {
  const handleEdit = () => {
    if (handleUpdate) {
      handleUpdate(event);
    }
  };
  const is_dark = useDark();
  const theme = useMantineTheme();
  const profile= useUser()
  const user= event.user === profile.data?.id 

  // Format start and end times for display
  const startDateTime = event.event_time_slots[0]
    ? new Date(`${event.event_time_slots[0].date}T${event.event_time_slots[0].start_time}`)
    : new Date(event.start_date);
  const endDateTime = new Date(event.end_date);
 
  const nextStartDateTime = event.next_occurence?.start_date
  ? new Date(`${event.next_occurence?.start_date}T${event.event_time_slots[0].start_time}`)
  : new Date(event.start_date);

 const nextEndDateTime = event.next_occurence?.start_date &&new Date(`${event.next_occurence.end_date}T${event.event_time_slots[0].end_time}`)
  

  const today = dayjs().format('YYYY-MM-DD');
  const formattedNextDate= dayjs( nextStartDateTime). format('YYYY-MM-DD')

 

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      
      withBorder
      style={{
        width: "100%",
        // maxWidth: "400px",
        margin: 'auto',
        backgroundColor: is_dark ? theme.colors.dark[7] : theme.colors.homaaleSlate[0],
        marginBlock: "10px"
      }}
    >
      {/* Header with Title and Event Type Badge */}
      <Group position='left' mb="xs">
        <Tooltip label={event.title} withArrow>
          <Text
            truncate
            weight={500}
            size={25}
            lineClamp={2}
          >
            {event.title}
          </Text>
        </Tooltip>
        <Badge
          color={event.color_tag || 'green'}
          variant="light"
        >
          {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
        </Badge>
      </Group>

      {/* Event Details */}
      <Box>
        {event.description && (
          <Group spacing="xs" mb="xs">
            <Text size="sm" color={is_dark ? "white" : "black"} weight={500}>
              Description:
            </Text>
            <Text size="sm" color="dimmed">
              {event.description}
            </Text>
          </Group>
        )}
         <Group spacing="xs" mb="xs">
            <Text size="sm" color={is_dark ? "white" : "black"} weight={500}>
              Created By:
            </Text>
            <Text size="sm" color="dimmed">
              {event.created_by}
            </Text>
          </Group>


        {event.location && (
          <Group spacing="xs" mb="xs">
            <Text size="sm" color={is_dark ? "white" : "black"} weight={500}>
              Location:
            </Text>
            <Text size="sm" color="dimmed">
              {event.location}
            </Text>
          </Group>
        )}
        <Group spacing="xs" mb="xs">
          <Text size="sm" color={is_dark ? "white" : "black"} weight={500}>
            Start:
          </Text>
          <Text size="sm" color="dimmed">
           {event.next_occurence &&today===formattedNextDate?
           
           nextStartDateTime.toLocaleString('en-US', {
             weekday: 'short',
             month: 'short',
             day: 'numeric',
             hour: '2-digit',
             minute: '2-digit',
             
           }):
            startDateTime.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
          } 
          
          </Text>
        </Group>
        <Group spacing="xs">
          <Text size="sm" color={is_dark ? "white" : "black"} weight={500}>
            End:
          </Text>
          <Text size="sm" color="dimmed">
            { event.next_occurence && today===formattedNextDate?
              nextEndDateTime?.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              :
            endDateTime.toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Group>
        {event.repeat !== RepeatChoice.None && (
          <Group spacing="xs"mt={"sm"} mb="xs">
            <Text size="sm" color={is_dark ? "white" : "black"} weight={500}>
              Repeat:
            </Text>
            <Text size="sm" color="dimmed">
              {event.repeat.charAt(0).toUpperCase() + event.repeat.slice(1)}
            </Text>
            {/* <Text size="sm" color={is_dark ? "white" : "black"} weight={500}>
             Next ocuurance Date:
             <Text size="sm" color="dimmed">
              {nextStartDateTime.toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              
            })}
            </Text>
            </Text>
            <Text size="sm" color="dimmed">
              {event.next_occurence?.start_date}
            </Text> */}


          </Group>
          
        )}
      </Box>

      {/* Optional Action Buttons */}
      <Flex>
        <Group position='left' mt="md">
          <Badge
            color={event.visibility ? 'cyan' : 'green'}
            variant="light"
          >
            {event.visibility ? 'Public Event' : 'Private Event'}
          </Badge>
        </Group>
        {
       user
        &&
         isLoggedIn() && (
          <Group position="right" mt="md">
            <Button
              variant="subtle"
              color={is_dark ? "gray" : "black"}
              size="xs"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="subtle"
              color="red"
              size="xs"
              onClick={() => handleDelete && handleDelete(event.id)}
            >
              Delete
            </Button>
          </Group>
        )}
      </Flex>
    </Card>
  );
}