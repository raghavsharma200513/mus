import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { saveProfile } from "../../redux/slices/profileReducer";

interface FormData {
  mobile_number: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<FormData>({
    mobile_number: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { mobile_number, password } = formData;
    if (!mobile_number || !password) {
      setError("Both fields are required");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        formData
      );

      setSuccess("Login Successful");
      dispatch(saveProfile(response.data.data));
      localStorage.setItem("token", response.data.data.token);

      if (response.data.data.user.role === "admin") {
        window.location.href = "/adminnavbar";
      } else {
        window.location.href = "/";
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Something went wrong");
      }
    }
  };

  const handleGuestLogin = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        { type: "guest" }
      );

      setSuccess("Login Successful");
      dispatch(saveProfile(response.data.data));
      localStorage.setItem("token", response.data.data.token);
      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Something went wrong");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-[80vh] bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center text-[#554539] mb-6">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <input
              type="text"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#554539]"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#554539]"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full py-2 text-white bg-[#2E0A16] rounded hover:bg-opacity-90"
            >
              Login
            </button>

            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2 text-white bg-[#554539] rounded hover:bg-opacity-90"
            >
              Login as Guest
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-center">
          Don&#39;t have an account?{" "}
          <Link to="/register" className="text-[#2E0A16] underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
