import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from 'axios';
import { UserContext } from "../UserContext";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    async function handleLoginSubmit(ev) {
        ev.preventDefault();
        try {
            // Send POST request to the backend
            const {data} = await axios.post('/login', { email, password }, { withCredentials: true });
            setUser(data)
            alert('Login successful')
            setRedirect(true);
        } catch (e) {
            // Handle error response from server
           alert('Login failed')
        }
        
    }

    if (redirect) {
        return <Navigate to="/" replace />;
    }


    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Login</h1>
                <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={ev => setEmail(ev.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={ev => setPassword(ev.target.value)}
                    />
                    <button className="primary">Login</button>
                    <div className="text-center py-2 text-gray-500">
                        Don't have an account yet? <Link className="underline text-bn" to={'/register'}>Register Now</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
