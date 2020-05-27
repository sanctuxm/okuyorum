import { db } from '../../../db'
import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from  'bcrypt'

function validateEmail(email): boolean {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method !== "POST") {
        res.status(405).end();
    }

    try {
       const {username, email , pw } = req.body;
       
       if((!email || email.length < 6) || (!pw || pw.length < 6) || (!username || username.length < 6)) {
            res.status(400).json({
                message: 'Values must be longer than 5 characters.'
            })
        }

        if(email.length > 32 || pw.length > 32 || username.length > 32) {
            res.status(400).json({
                message: 'Values can\'t be longer than 32 characters.'
            })
        }

       if(!validateEmail(email)) {
            res.status(400).json({
                message: 'Enter a valid e-mail.'
            })
        }

       const password_hash = await hash(pw, 12);
       const post = await db.users.create({username: <string>username, email: <string>email, password_hash})
       res.status(200).json({email: post.email});
    } catch (e) {
       console.error(e);
       let message = "A error occured.";
       let code = 500;
       if(e.code === '23505') {
           code = 400;
           message = "E-Mail or username already exists."
       }
       res.status(code).json({message});
    }
 };
  