
import { SignIn } from "@/components/signin";
import Image from "next/image";

export default function Home() {
  console.log(process.env.GOOGLE_CLIENT_ID)
  return (

    <div>
    <SignIn></SignIn>
    
    </div>
    
  );
}
