import { useMutation } from 'react-query';
import Dialog from './Dialog';
import { registerUser } from 'src/utils/requests';
import { signIn } from 'next-auth/react';

interface RegisterDialogProps {
    onClose: () => void;
}

const RegisterDialog = ({ onClose }: RegisterDialogProps) => {
    const {
        mutate: register,
        isLoading,
        error,
    } = useMutation(registerUser, {
        onSuccess(data, variables, context) {
            signIn('credentials', {
                name: variables.email,
                password: variables.password,
            });
        },
    });

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        const { email, username, password } = e.target as typeof e.target & {
            email: { value: string };
            username: { value: string };
            password: { value: string };
        };

        register({
            email: email.value,
            password: password.value,
            name: username.value,
        });
    };

    const handleClose = () => !isLoading && onClose();

    return (
        <Dialog title="Register" onClose={handleClose}>
            <form onSubmit={handleSubmit}>
                <div className="flex w-full flex-col p-6 space-y-2">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="">
                            Email
                        </label>
                        <input
                            name="email"
                            id="email"
                            type="text"
                            className="input"
                            placeholder="example@email.com"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="">
                            Username
                        </label>
                        <input
                            name="username"
                            id="username"
                            type="text"
                            className="input"
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email">Password</label>
                        <input
                            name="password"
                            id="password"
                            type="password"
                            className="input"
                            placeholder="Password"
                            min={8}
                            required
                        />
                    </div>

                    <div className="flex w-full h-6">
                        {Boolean(error) && (
                            <label className=" text-red-500 w-full text-center">
                                {/* @ts-ignore */}
                                {error?.response?.data?.error}
                            </label>
                        )}
                    </div>

                    <div className="flex w-full gap-6">
                        <button
                            className="btn-secondary w-full"
                            disabled={isLoading}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isLoading}
                            className="btn-primary w-full"
                            type="submit"
                        >
                            Register
                        </button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default RegisterDialog;
