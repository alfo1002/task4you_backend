import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail {

    static sendConfirmationEmail = async (user: IEmail) => {
        await transporter.sendMail({
            from: 'Task4you <admin@task4you.com>',
            to: user.email,
            subject: 'Confirma tu cuenta - Task4you',
            text: `Para confirmar cuenta`,
            html: `<p>Hola: ${user.name}, has creado tu cuenta,
            para confirmarla haz click en el siguiente enlace:</p>
            <a href="">Confirmar cuenta</a>
            <p>Ingresa el codigo: <b>${user.token}</b></p>
            <p>Este token expira en 10 min</p>
            `

        })
    }

}