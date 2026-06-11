import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { validatePassword } from "firebase/auth";
import { fieldImage } from "../../_utility/getField";
import { AuthService } from "../../_services/auth";
import { simLogos } from "../../_constants/logos";
import { useAuthStore } from "../../context/AuthContext";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { AvailableTeamsModal } from "./AvailableTeamsModal";
import { useModal } from "../../_hooks/useModal";

// ✅ Form State Interface
interface SignUpForm {
  username: { value: string };
  email: { value: string };
  password: { value: string };
}

// ✅ Auth Response Type
interface AuthResponse {
  status: boolean;
  message: string;
}

export const SignUpPage = () => {
  const { setCurrentUser } = useAuthStore();
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [fieldImg] = useState(() => fieldImage());
  const handleAvailableTeamsModal = useModal();

  const [form, setForm] = useState<SignUpForm>({
    username: { value: "" },
    email: { value: "" },
    password: { value: "" },
  });

  useEffect(() => {
    console.log("REGISTER PAGE LOADED!");
  }, []);

  useEffect(() => {
    console.log("REGISTER!");
  }, []);

  // ✅ Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: { value },
    }));
  };

  // ✅ Handle form submission
  const submitForm = async (e: FormEvent) => {
    e.preventDefault();

    if (form.username.value && form.email.value && form.password.value) {
      setProcessing(true);

      try {
        const data: AuthResponse = await AuthService.register(
          form.username.value,
          form.email.value,
          form.password.value
        );

        if (data.status) {
          enqueueSnackbar(data.message, {
            variant: "success",
            autoHideDuration: 3000,
          });
          // const user = {
          //   username: form.username.value,
          // };
          // // setCurrentUser({ ...user } as CurrentUser);
          navigate(`/`);
        } else {
          enqueueSnackbar(data.message, {
            variant: "error",
            autoHideDuration: 3000,
          });
        }
      } catch (error) {
        enqueueSnackbar("Something went wrong.", {
          variant: "error",
          autoHideDuration: 3000,
        });
      } finally {
        setProcessing(false);
      }
    } else {
      enqueueSnackbar("All fields are required.", {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  return (
    <section className="w-screen">
      <AvailableTeamsModal
        isOpen={handleAvailableTeamsModal.isModalOpen}
        onClose={handleAvailableTeamsModal.handleCloseModal}
      />
      <div className="lg:grid lg:grid-cols-12 lg:w-full xl:grid xl:min-h-screen">
        <section className="relative flex items-end bg-gray-900 col-span-12 h-screen">
          <img
            alt="Night"
            src={fieldImg}
            className="absolute inset-0 h-full w-full object-cover opacity-90"
          />

          <div className="hidden md:flex flex-col items-center my-auto md:relative lg:p-12 bg-black/75 align-middle rounded-md min-w-full">
            <img src={`${simLogos.SimSN}`} className="h-40" alt="SimSNLogo" />
            <div className="flex flex-wrap gap-4 mt-4">
              {Object.entries(simLogos)
                .slice(2, 8) // Get entries from index 2 to 7
                .map(([key, value]) => (
                  <img
                    key={key}
                    src={value}
                    className="h-16 opacity-70"
                    alt={`${key}Logo`}
                  />
                ))}
            </div>

            <h2 className="mt-6 text-2xl font-bold sm:text-3xl md:text-4xl">
              Sign Up
            </h2>

            <p className="mt-4 leading-relaxed ">
              Where Dynasties are made and the simulations are plentiful.
            </p>
            <form
              action="#"
              className="mt-8 grid grid-cols-6 gap-6"
              onSubmit={submitForm}
            >
              <div className="col-span-12 sm:col-span-6">
                <label className="block text-sm font-medium ">Username</label>

                <input
                  type="text"
                  id="Username"
                  name="username"
                  className="mt-1 w-[25em] rounded-md border-gray-200  text-sm  shadow-xs"
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-12 sm:col-span-6">
                <label className="block text-sm font-medium ">Email</label>

                <input
                  type="email"
                  id="Email"
                  name="email"
                  className="mt-1 w-[25em] rounded-md border-gray-200 text-sm shadow-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-12 sm:col-span-6">
                <label className="block text-sm font-medium ">Password</label>

                <input
                  type={passwordVisibility ? "text" : "password"}
                  id="Password"
                  name="password"
                  className="mt-1 w-[25em] rounded-md border-gray-200 text-sm shadow-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-6 sm:flex-col sm:items-center sm:gap-4">
                <button
                  type="submit"
                  className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-hidden focus:ring-3 active:text-blue-500"
                >
                  {processing ? "Processing..." : "Create an account"}
                </button>

                <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                  Already have an account?
                  <NavLink to={"/login"} className=" underline">
                    Log in
                  </NavLink>
                  .
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Want to view teams?{" "}
                  <span
                    className=" underline font-semibold cursor-pointer text-[#646cff] hover:text-[#535bf2]"
                    onClick={handleAvailableTeamsModal.handleOpenModal}
                  >
                    Click Here
                  </span>
                  .
                </p>
              </div>
            </form>
          </div>

          <main className="md:hidden flex items-center justify-center px-4 sm:px-8 sm:py-8 my-auto">
            <div className="max-w-xl lg:max-w-3xl">
              <div className="relative flex flex-col items-center py-6 px-10 rounded-lg bg-black/75 align-middle min-w-full">
                <img
                  src={`${simLogos.SimSN}`}
                  className="h-20"
                  alt="SimSNLogo"
                />

                <h1 className="mt-2 text-2xl font-bold  sm:text-3xl md:text-4xl">
                  Welcome to SimSN 🦑
                </h1>

                <p className="mt-4 leading-relaxed ">
                  Where Dynasties are made and the simulations are plentiful.
                </p>
                <form
                  action="#"
                  className="mt-8 grid grid-cols-6 gap-6"
                  onSubmit={submitForm}
                >
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium ">
                      Username
                    </label>

                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="mt-1 w-full rounded-md border-gray-200 text-sm shadow-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium ">Email</label>

                    <input
                      type="email"
                      id="Email"
                      name="email"
                      className="mt-1 w-full rounded-md border-gray-200 text-sm shadow-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium ">
                      Password
                    </label>

                    <input
                      type={passwordVisibility ? "text" : "password"}
                      id="Password"
                      name="password"
                      className="mt-1 w-full rounded-md border-gray-200 text-sm shadow-xs dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-6 sm:flex sm:items-center sm:gap-4">
                    <button
                      type="submit"
                      className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-hidden focus:ring-3 active:text-blue-500"
                    >
                      {processing ? "Processing..." : "Create an account"}
                    </button>

                    <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                      Already have an account?
                      <NavLink to={"/login"} className=" underline">
                        Log in
                      </NavLink>
                      .
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                      Want to view teams?{" "}
                      <span
                        className=" underline font-semibold cursor-pointer text-[#646cff] hover:text-[#535bf2]"
                        onClick={handleAvailableTeamsModal.handleOpenModal}
                      >
                        Click Here
                      </span>
                      .
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </section>
      </div>
    </section>
  );
};
