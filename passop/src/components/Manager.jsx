import React, { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'https://passop-mongo-pydf.onrender.com/api/passwords';

const Manager = () => {
  const imgRef = useRef();
  const inputRef = useRef();
  const [form, setForm] = useState({ site: "", username: "", password: "" });
  const [passwordArray, setPasswordArray] = useState([]);
  const [visible, setVisible] = useState(false);
  const [showIndexes, setShowIndexes] = useState({});
  const [currentlyEditing, setCurrentlyEditing] = useState(null);

  useEffect(() => {
    fetch(API_BASE)
      .then((res) => res.json())
      .then((data) => {
        setPasswordArray(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch passwords.");
      });
  }, []);

  const showPassword = () => setVisible(prev => !prev);

  const toggleRowVisibility = (index) => {
    setShowIndexes(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const savePassword = async () => {
    if (!form.site || !form.username || !form.password) {
      toast.warn("Please fill all fields!");
      return;
    }

    try {
      if (currentlyEditing) {
        const res = await fetch(`${API_BASE}/${currentlyEditing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });

        if (!res.ok) throw new Error('Update failed');

        const updatedPassword = await res.json();
        setPasswordArray((prev) =>
          prev.map((item) => (item._id === updatedPassword._id ? updatedPassword : item))
        );
        toast.success("Password updated!");
      } else {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });

        if (!res.ok) throw new Error('Add failed');

        const newPassword = await res.json();
        setPasswordArray((prev) => [...prev, newPassword]);
        toast.success("Password added!");
      }

      setForm({ site: "", username: "", password: "" });
      setCurrentlyEditing(null);
    } catch (error) {
      toast.error("Failed to save password.");
      console.error(error);
    }
  };

  const editPassword = (id) => {
    const item = passwordArray.find((p) => p._id === id);
    setForm(item);
    setCurrentlyEditing(id);
  };

  const deletePassword = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');

      setPasswordArray((prev) => prev.filter((item) => item._id !== id));
      toast.info("Password deleted!");
      setForm({ site: "", username: "", password: "" });
      setCurrentlyEditing(null);
    } catch (error) {
      toast.error("Failed to delete password.");
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      transition: Bounce,
    });
  };

  return (
    <>
      <ToastContainer />
      <div className="absolute top-0 z-[-2] h-full w-full bg-green-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <div className="bg-slate-50 rounded-lg shadow-lg px-4 py-6 sm:px-8 md:px-16 lg:px-32 my-8 mx-auto container">
        <h1 className="text-4xl font-extrabold text-center mb-6">
          <span className="text-green-500">&lt;</span> Pass <span className="text-green-500">OP/&gt;</span>
        </h1>
        <p className="text-base text-green-900 text-center mb-8">Your Own Password Manager</p>

        <div className="flex flex-col gap-4 sm:gap-6">
          <input value={form.site} onChange={handleChange} className="rounded-full border border-green-500 text-black px-4 py-2 w-full text-sm" type="text" name="site" placeholder="Enter website" />
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
            <input value={form.username} onChange={handleChange} className="rounded-full border border-green-500 text-black px-4 py-2 w-full text-sm" type="text" name="username" placeholder="Enter username" />
            <div className="relative w-full">
              <input value={form.password} onChange={handleChange} ref={inputRef} className="rounded-full border border-green-500 text-black px-4 py-2 pr-10 w-full text-sm" type={visible ? "text" : "password"} name="password" placeholder="Enter password" />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={showPassword}>
                <img ref={imgRef} src={visible ? "/icons/hidden.png" : "/icons/view.png"} alt="toggle-password" className="w-5 h-5" />
              </span>
            </div>
          </div>
          <button onClick={savePassword} className="flex items-center justify-center gap-2 bg-green-400 hover:bg-green-500 text-white font-semibold px-5 py-2 rounded-full w-full text-sm transition-all duration-300">
            <lord-icon src="https://cdn.lordicon.com/sbnjyzil.json" trigger="hover" colors="primary:#000000" style={{ width: "20px", height: "20px" }}></lord-icon>
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
                  <tr key={item._id} className="border-t border-green-300">
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
                          src={showIndexes[index] ? "/icons/hidden.png" : "/icons/view.png"}
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
                        onClick={() => editPassword(item._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => deletePassword(item._id)}
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
