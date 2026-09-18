import { redirect } from "next/navigation";

export default function MunicipalRedirect({ params }: { params: { ubigeo: string } }) {
    redirect(`/dashboard/${params.ubigeo}`);
}
