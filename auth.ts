import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prismaClient } from "./app/lib/db"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],

  callbacks: {
   async signIn({user, email}) {
     console.log({user, email})
     try {
      await prismaClient.user.create({
         data : {
          email : "",
         provider : ""
         }
      })
     }catch(e){

     }
      return true
    }
  }
})