

import { Appbar } from "@/components/appbar";
import Image from "next/image";

export default function Home() {
  console.log(process.env.GOOGLE_CLIENT_ID)
  return (

    <div>
    <Appbar></Appbar>
    </div>
    
  );
}
