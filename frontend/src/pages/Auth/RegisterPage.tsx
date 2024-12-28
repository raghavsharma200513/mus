import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface FormData {
  name: string;
  email: string;
  mobile_number: string;
  password: string;
  confirm_password: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobile_number: "",
    password: "",
    confirm_password: "",
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

    const { name, email, mobile_number, password, confirm_password } = formData;

    if (!name || !email || !mobile_number || !password || !confirm_password) {
      setError("All fields are required");
      return;
    }

    if (password !== confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        {
          name,
          email,
          mobile_number,
          password,
          type: "user",
        }
      );

      localStorage.setItem("token", data.data.token);

      setSuccess("Registration Successful. You can now login.");
      setFormData({
        name: "",
        email: "",
        mobile_number: "",
        password: "",
        confirm_password: "",
      });
      window.location.href = "/";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-[80vh] bg-gray-100 py-96 px-5">
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center text-[#554539] mb-6">
          Register
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#554539]"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#554539]"
            />
          </div>
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
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#554539]"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}

          <button
            type="submit"
            className="w-full py-2 text-white bg-[#2E0A16] rounded hover:bg-opacity-90"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#2E0A16] underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
