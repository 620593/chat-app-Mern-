import React from "react";

const Login = () => {
  return (
    <div className="flex flex-col items-cente justify-center min-w-96 mx-auto ">
      <div className="p-8 h-full w-full bg-blue-0 rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-50 border border-gray-100">
        <h1 className="text-3xl font-semibold text-center text-white">
          Login &nbsp;
          <span className="text-blue-600">ChatApp</span>
        </h1>
        <form action="">
          <div>
            <label htmlFor="username" className="label p-2">
              UserName :
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Enter username"
              className="w-full input input-bordered h-10"
            />
          </div>
          <div>
            <label htmlFor="password" className="label p-2">
              Password :
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              className="w-full input input-bordered h-10"
            />
          </div>
          <a
            href="#"
            className="text-sm hover:underline hover:text-blue-600 mt-2 inline-block"
          >
            {"Don't"} have an account?
          </a>
          <div>
            <button className="btn btn-block btn-sm mt-2 mb-4">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
