import { db } from '../../../db'
import { NextApiRequest, NextApiResponse } from 'next'
import { compare } from  'bcrypt'
import { sign } from 'jsonwebtoken'
import { serialize } from 'cookie'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method !== "POST") {
        res.status(405).end();
    }

    try {
       const {email , pw } = req.body;
       if((!email || email.length < 6) || (!pw || pw.length < 6)) {
        res.status(400).end(); 
       }

       const post = await db.users.findByEmail(<string>email)
       if(!post) {
        console.log(pw)
           console.log(req.body)
           throw Error("E-Mail not found")
       }
        const isPasswordRight = await compare(pw, post.password_hash)

        if(!isPasswordRight) {
        throw Error("Password is not right")
        }
        const claims = {
            id: post.id,
            email: post.email,
            username: post.username
        }

        const jwt = sign(claims, process.env.APP_SECRET)
        const authCookie = serialize('auth', jwt, {
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 72576000,
            httpOnly: true,
            path: '/',
            })

        res.setHeader('Set-Cookie', authCookie)
        res.status(200).json({'message': 'ya mate get in', 'jwt': jwt}); 
        return
           

       throw new Error();
    } catch (e) {
       console.error(e);
       let message = "Wrong e-mail or password.";
       let code = 400;
       res.status(code).json({message});
    }
 };
  