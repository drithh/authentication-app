"use client";
import Button from "~/components/button";
import Layout from "~/components/layout";
import OtpInput from "react-otp-input";
import { useState } from "react";
export default function OTP() {
  const [otp, setOtp] = useState("");
  const handleChange = (enteredOtp: string) => {
    setOtp(enteredOtp);
  };

  return (
    <Layout>
      <h1 className="mb-8 text-center text-5xl font-bold uppercase tracking-tight text-slate-700">
        Enter OTP
      </h1>
      <div className="flex w-[40rem] flex-col items-center justify-center gap-8 place-self-center border-y-2 border-slate-500 p-8">
        <div className="flex flex-col gap-y-2">
          <p className="text-center text-lg text-slate-700">
            Looks like you are enacting 2FA.
          </p>
          <p className="text-center text-lg text-slate-700">
            Please enter the TOTP code from your device.
          </p>
        </div>
        <div className="relative mb-4 flex w-full flex-row gap-x-2">
          <OtpInput
            containerStyle={
              "flex w-full flex-row place-content-between place-items-center"
            }
            inputStyle={{
              width: "5rem",
              border: "2px solid rgb(100 116 139)",
              padding: "0.5rem",
              outline: "none",
            }}
            value={otp}
            onChange={handleChange}
            numInputs={6}
            renderInput={(props) => <input {...props} />}
          />
        </div>
        <Button
          type="submit"
          onClick={() => {
            console.log(otp);
          }}
        >
          Submit
        </Button>
      </div>
    </Layout>
  );
}
