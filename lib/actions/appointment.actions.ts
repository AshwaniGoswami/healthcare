"use server";

import { revalidatePath } from "next/cache";
import {  ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";

import { formatDateTime, parseStringify } from "../utils";
import { APPOINTMENT_COLLECTION_ID, DATABASE_ID,  databases,  messaging, PATIENT_COLLECTION_ID } from "../appwrite.config";

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    const docID=ID.unique()
    console.log(appointment)
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      docID,
      {
        ...appointment,
    
      }
    );

    revalidatePath("/admin");
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
  }
};

//  GET RECENT APPOINTMENTS if paitnt is unavailable due to passing it as appointment instead of {...appointment} in createAppointment method
// export const getRecentAppointmentList = async () => {
//   try {
//     // Fetch all appointments
//     const appointments = await databases.listDocuments(
//       DATABASE_ID!,
//       APPOINTMENT_COLLECTION_ID!,
     
//     );
//     // Fetch all patients
//     const patients = await databases.listDocuments(
//       DATABASE_ID!,
//       PATIENT_COLLECTION_ID!,
//       [Query.orderDesc("$createdAt")]
//     );

//     // Create a map of userId to patient for quick lookup
//     const patientMap = new Map(patients.documents.map(patient => [patient.userId, patient]));

//     // Create a map of userId to appointments for quick lookup
//     const appointmentMap = new Map();
//     appointments.documents.forEach(appointment => {
//       if (!appointmentMap.has(appointment.userId)) {
//         appointmentMap.set(appointment.userId, []);
//       }
//       appointmentMap.get(appointment.userId).push(appointment);
//     });

//     // Combine patients with their appointments
//     const appointmentsWithPatients = appointments.documents.map(appointment => ({
//       ...appointment,
//       patient: patientMap.get(appointment.userId) || null
//     }));

//     const initialCounts = {
//       scheduledCount: 0,
//       pendingCount: 0,
//       cancelledCount: 0,
//     };

//     // Calculate counts based on appointment status
//     const counts = appointments.documents.reduce(
//       (acc, appointment) => {
//         switch (appointment.status) {
//           case "scheduled":
//             acc.scheduledCount++;
//             break;
//           case "pending":
//             acc.pendingCount++;
//             break;
//           case "cancelled":
//             acc.cancelledCount++;
//             break;
//         }
//         return acc;
//       },
//       initialCounts
//     );

//     // Prepare the final data with counts and appointments
//     const data = {
//       totalCount: appointments.total,
//       ...counts,
//       documents: appointmentsWithPatients,
//     };



//     return parseStringify(data);
//   } catch (error) {
//     console.error("An error occurred while retrieving the recent appointments:", error);
//     return null; 
//   }
// };
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    // const scheduledAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "scheduled");

    // const pendingAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "pending");

    // const cancelledAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "cancelled");

    // const data = {
    //   totalCount: appointments.total,
    //   scheduledCount: scheduledAppointments.length,
    //   pendingCount: pendingAppointments.length,
    //   cancelledCount: cancelledAppointments.length,
    //   documents: appointments.documents,
    // };

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
      (acc, appointment) => {
        switch (appointment.status) {
          case "scheduled":
            acc.scheduledCount++;
            break;
          case "pending":
            acc.pendingCount++;
            break;
          case "cancelled":
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    // https://appwrite.io/docs/references/1.5.x/server-nodejs/messaging#createSms
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("An error occurred while sending sms:", error);
  }
};

//  UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    // Update appointment to scheduled -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#updateDocument

    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );
    if (!updatedAppointment) throw Error;

//     const smsMessage = `Greetings from CarePulse. ${type === "schedule" ? `Your appointment is confirmed for ${formatDateTime(appointment.schedule!).dateTime} with Dr. ${appointment.primaryPhysician}` : `We regret to inform that your appointment for ${formatDateTime(appointment.schedule!).dateTime} is cancelled. Reason:  ${appointment.cancellationReason}`}.`;
//     await sendSMSNotification(userId, smsMessage);

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error);
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing patient:",
      error
    );
  }
};