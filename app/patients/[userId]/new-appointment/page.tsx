import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getPatients } from "@/lib/actions/patient.actions";
import Image from "next/image";

export default async function NewAppointment({
  params: { userId },
}: SearchParamProps) {
  const patient = await getPatients(userId);

  return (
    <main>
      <div className="flex max-h-screen h-screen">
        <section className="remove-scrollbar container my-auto">
          <div className="sub-container max-w-[860px] flex-1 justify-between">
            <Image
              src="/assets/images/LogoNew.png"
              alt="logo"
              width={1000}
              height={1000}
              className="mb-12 h-10 w-fit"
            />

            <AppointmentForm
              type="create"
              userId={userId}
              patientId={patient?.$id}
            />
            <div className="text-14-regular mt-20 flex justify-between">
              <p className="copywrite mt-10 py-12">copywrite 2024</p>
            </div>
          </div>
        </section>
        <Image
          src="/assets/images/appointment-img.png"
          height={1000}
          width={1000}
          alt="patient"
          className="side-img max-w-[390px] bg-bottom"
        />
      </div>
    </main>
  );
}
