import Image from "next/image";
import {useEffect, useState} from "react";
import apiClient from "@/axiosConfig";
import {toast} from "@/components/common/Toast";
import {Input, useMantineTheme} from "@mantine/core";

const features = [
  {
    title: "Quality Products",
    description:
      "We guarantee the quality of all the cakes we provide as they are baked using the freshest ingredients.",
    icon: "🧁",
  },
  {
    title: "Free Delivery",
    description:
      "All orders submitted by our Australian clients are delivered for free throughout the Australia.",
    icon: "🚚",
  },
  {
    title: "Catering Service",
    description:
      "Our bakery also provides an outstanding catering service for events and special occasions.",
    icon: "🎉",
  },
  {
    title: "Online Payment",
    description:
      "We accept all kinds of online payments including Visa, MasterCard and Express credit cards.",
    icon: "💳",
  },
];

const WhyChooseUs = () => {
  const [email, setEmail] = useState("");
  const theme = useMantineTheme();
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      const response = await apiClient.post("/support/newsletter/subscribe/", { email });
      toast.success(response.data.message || "Subscribed successfully");
      setEmail("");
      setError("");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Enter a valid email!";
      toast.error(errorMessage);
    }
  };
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  return (
      <div className="flex flex-col gap-12 mt-3 rounded-sm">
        <section className="py-20 bg-[#fffaf5]">
          <div className="w-full px-3 text-center">
            <h2 className="text-4xl font-bold text-[#333] mb-4 relative inline-block">
            <span className="flex relative z-10 text-2xl md:text-4xl font-bold ">
              <p style={{marginRight: 10,color: theme.colors.brand[7]}}>WHY</p>CHOOSE US{" "}
            </span>
              <span
                  className="absolute bottom-0 transform -translate-x-4 w-20 h-1 bg-orange-400 z-0 rounded"></span>
            </h2>
            <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
              Discover what sets us apart and why our customers love our service.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
              {/* Left Features */}
              <div className="flex flex-col gap-10">
                {features.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start text-left">
                      <div
                          className="w-12 h-12 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-2xl">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="md:text-3xl text-xl font-semibold text-gray-800 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                ))}
              </div>

              {/* Center Image */}
              <div className="md:flex hidden justify-center">
                <Image
                    src="../assets/two.png"
                    alt="Why Choose Us"
                    width={350}
                    height={350}
                    className="object-contain "
                />
              </div>

              {/* Right Features */}
              <div className="flex flex-col gap-10">
                {features.slice(2).map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start text-left">
                      <div
                          className="w-12 h-12 rounded-full bg-pink-100 text-orange-500 flex items-center justify-center text-2xl">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="md:text-3xl text-xl font-semibold text-gray-800 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* //subscribe section */}

        {/*<div style={{ backgroundColor: theme.colors.brand[3] }} className="py-6 rounded-sm">*/}
        {/*  <div className="w-full px-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">*/}
        {/*    /!* Left Section with Icon and Text *!/*/}
        {/*    <div className="flex items-center gap-4 flex-shrink-0">*/}
        {/*      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">*/}
        {/*        <svg*/}
        {/*            className="w-6 h-6 text-gray-600"*/}
        {/*            fill="none"*/}
        {/*            stroke="currentColor"*/}
        {/*            viewBox="0 0 24 24"*/}
        {/*        >*/}
        {/*          <path*/}
        {/*              strokeLinecap="round"*/}
        {/*              strokeLinejoin="round"*/}
        {/*              strokeWidth={2}*/}
        {/*              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"*/}
        {/*          />*/}
        {/*        </svg>*/}
        {/*      </div>*/}
        {/*      <h3 className="text-xl font-semibold text-gray-800">Sign up to Newsletter</h3>*/}
        {/*    </div>*/}

        {/*    /!* Input + Button *!/*/}
        {/*    <div className="flex w-full sm:w-auto">*/}
        {/*      <input*/}
        {/*          type="email"*/}
        {/*          placeholder={error || "Enter your email"}*/}
        {/*          value={email}*/}
        {/*          onChange={handleChange}*/}
        {/*          className={`px-4 py-3 w-full sm:w-80 rounded-l-md focus:outline-none focus:ring-2 text-gray-700 ${*/}
        {/*              error*/}
        {/*                  ? "border border-red-500 placeholder-red-500 focus:ring-red-500"*/}
        {/*                  : "border border-gray-300 focus:ring-gray-400"*/}
        {/*          }`}*/}
        {/*          aria-invalid={!!error}*/}
        {/*      />*/}
        {/*      <button*/}
        {/*          onClick={handleSubscribe}*/}
        {/*          className="px-6 py-3 bg-gray-800 text-white rounded-r-md hover:bg-gray-900 transition-colors duration-200 font-medium"*/}
        {/*      >*/}
        {/*        Subscribe*/}
        {/*      </button>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>

  )
      ;
};

export default WhyChooseUs;
