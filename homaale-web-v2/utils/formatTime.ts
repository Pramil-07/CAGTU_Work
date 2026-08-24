import { format } from "date-fns";

export const formatTime = (time: string) => {
    const [hour, minute, seconds] = time
        .split(":")
        .map((item) => parseInt(item, 10));
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const newDate = new Date(year, month, day, hour, minute, seconds);

    const formattedTime = format(newDate, "p");
    return formattedTime;
};

/**
 * To convert time to new Date() format
 * @param time:string
 * @returns Date
 */
export const formatDate = (time: string) => {
    const today = new Date();
    const [hours, minutes] = time ? time.split(":") : [];
    const resultDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        parseInt(hours),
        parseInt(minutes)
    );
    return resultDate;
};

export const convertTimeStringToDateString = (value: string) =>
    new Date(
        `${new Date().toISOString().split("T")[0]}T${value}`
    ) as unknown as string;

//Function to convert time i.e. 14:00:00 to 12hr i.e. 2:00pm format
export function convertTo12HourFormat(time: string) {
    //padStart adds Inital 0 to make length more than 8 digits
    time = time?.padStart(8, "0");
    const options: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "UTC",
    };
    return new Intl.DateTimeFormat("en-US", options)?.format(
        new Date("1970-01-01T" + time + "Z")
    );
}
