import React, { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Manager = () => {
  const imgRef = useRef();
  const inputRef = useRef();
  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);
  const [visible, setVisible] = useState(false);
  const [showIndexes, setShowIndexes] = useState({});
  const [currentlyEditing, setCurrentlyEditing] = useState(null);

  const getPasswords = async () => {
    try {
      const res = await fetch("http://localhost:3000/");
      const data = await res.json();
      setPasswordArray(data);
    } catch (error) {
      toast.error("Failed to fetch passwords from server");
    }
  };

  useEffect(() => {
    getPasswords();
  }, []);

  const showPassword = () => setVisible(prev => !prev);

  const toggleRowVisibility = (index) => {
    setShowIndexes(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const savePassword = async () => {
    if (!form.site.trim() || !form.username.trim() || !form.password.trim()) {
      toast.warn("Please fill all fields!");
      return;
    }

    try {
      if (currentlyEditing !== null) {
        const res = await fetch("http://localhost:3000/", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        const data = await res.json();

        if (data.success) {
          const updated = [...passwordArray];
          updated[currentlyEditing] = form;
          setPasswordArray(updated);
          toast.success("Password updated!");
        } else {
          throw new Error();
        }
        setCurrentlyEditing(null);
      } else {
        const res = await fetch("http://localhost:3000/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        });

        const data = await res.json();

        if (data.success) {
          setPasswordArray(prev => [...prev, form]);
          toast.success("Password added!");
        } else {
          throw new Error();
        }
      }

      setForm({ site: "", username: "", password: "" });
    } catch {
      toast.error("Failed to save password");
    }
  };

  const editPassword = (index) => {
    setForm(passwordArray[index]);
    setCurrentlyEditing(index);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const deletePassword = async (index) => {
    const passwordToDelete = passwordArray[index];

    try {
      const res = await fetch("http://localhost:3000/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          site: passwordToDelete.site,
          username: passwordToDelete.username
        })
      });

      const data = await res.json();

      if (data.success) {
        const newArray = passwordArray.filter((_, i) => i !== index);
        setPasswordArray(newArray);
        toast.info("Password deleted!");
        setCurrentlyEditing(null);
        setForm({ site: "", username: "", password: "" });
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to delete password");
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast('📋 Copied to clipboard!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  return (
    <>
      <ToastContainer />
      <div className="absolute top-0 z-[-2] h-full w-full bg-green-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="bg-slate-50 rounded-lg shadow-lg px-4 py-6 sm:px-8 md:px-16 lg:px-32 my-8 mx-auto container">
        <h1 className="text-4xl font-extrabold text-center mb-6">
          <span className="text-green-500">&lt;</span>
          Pass
          <span className="text-green-500">OP/&gt;</span>
        </h1>

        <p className="text-base text-green-900 text-center mb-8">
          Your Own Password Manager
        </p>

        <div className="flex flex-col gap-4 sm:gap-6">
          <input
            value={form.site}
            onChange={handleChange}
            className="rounded-full border border-green-500 text-black px-4 py-2 w-full text-sm"
            type="text"
            name="site"
            placeholder="Enter website"
          />

          <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
            <input
              value={form.username}
              onChange={handleChange}
              className="rounded-full border border-green-500 text-black px-4 py-2 w-full text-sm"
              type="text"
              name="username"
              placeholder="Enter username"
            />

            <div className="relative w-full">
              <input
                value={form.password}
                onChange={handleChange}
                ref={inputRef}
                className="rounded-full border border-green-500 text-black px-4 py-2 pr-10 w-full text-sm"
                type={visible ? "text" : "password"}
                name="password"
                placeholder="Enter password"
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={showPassword}
              >
                <img
                  ref={imgRef}
                  src={visible ? "/icons/hidden.png" : "/icons/view.png"}
                  alt="toggle-password"
                  className="w-5 h-5"
                />
              </span>
            </div>
          </div>

          <button
            onClick={savePassword}
            className="flex items-center justify-center gap-2 bg-green-400 hover:bg-green-500 text-white font-semibold px-5 py-2 rounded-full w-full text-sm transition-all duration-300"
          >
            <lord-icon
              src="https://cdn.lordicon.com/sbnjyzil.json"
              trigger="hover"
              colors="primary:#000000"
              style={{ width: "20px", height: "20px" }}
            ></lord-icon>
            {currentlyEditing !== null ? "Update Password" : "Add Password"}
          </button>
        </div>

        <div className="mt-10 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Your Passwords</h2>
          <table className="w-full text-left border border-green-300 text-sm">
            <thead>
              <tr className="bg-green-200">
                <th className="p-2">Website</th>
                <th className="p-2">Username</th>
                <th className="p-2">Password</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {passwordArray.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-400">
                    No passwords saved yet.
                  </td>
                </tr>
              ) : (
                passwordArray.map((item, index) => (
                  <tr key={index} className="border-t border-green-300">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={item.site.startsWith("http") ? item.site : `https://${item.site}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {item.site}
                        </a>
                        <img
                          src="/icons/copy.png"
                          alt="copy"
                          className="w-4 h-4 cursor-pointer"
                          onClick={() => handleCopy(item.site)}
                        />
                      </div>
                    </td>

                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span>{item.username}</span>
                        <img
                          src="/icons/copy.png"
                          alt="copy"
                          className="w-4 h-4 cursor-pointer"
                          onClick={() => handleCopy(item.username)}
                        />
                      </div>
                    </td>

                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span>
                          {showIndexes[index]
                            ? item.password
                            : "*".repeat(item.password.length)}
                        </span>
                        <img
                          src={
                            showIndexes[index]
                              ? "/icons/hidden.png"
                              : "/icons/view.png"
                          }
                          alt="toggle"
                          className="w-4 h-4 cursor-pointer"
                          onClick={() => toggleRowVisibility(index)}
                        />
                        <img
                          src="/icons/copy.png"
                          alt="copy"
                          className="w-4 h-4 cursor-pointer"
                          onClick={() => handleCopy(item.password)}
                        />
                      </div>
                    </td>

                    <td className="p-2 flex gap-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => editPassword(index)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deletePassword(index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Manager;
