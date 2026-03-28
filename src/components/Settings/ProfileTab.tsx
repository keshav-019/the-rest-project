'use client';

import { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { checkUsernameAvailability, getInitials } from "@/lib/firebase/auth";
import { updateUserProfileData } from "@/lib/firebase/profile";

export default function ProfileTab({
    setName,
    setLocalName,
    name,
    email,
    setEmail,
    bio,
    setBio,
    userName,
    setUserName
}: any) {

    const handleNameChange = (value: string) => {
        setLocalName(value);
        setName(value);
    };

    // ---------------- USERNAME STATE ----------------
    const [originalUsername, setOriginalUsername] = useState<string>("");
    const [usernameStatus, setUsernameStatus] =
        useState<"idle" | "checking" | "available" | "taken" | "current">("idle");

    useEffect(() => {
        if (userName && originalUsername === "") {
            setOriginalUsername(userName);
        }
    }, [userName, originalUsername]);

    useEffect(() => {
        if (!userName) {
            setUsernameStatus("idle");
            return;
        }

        if (userName === originalUsername) {
            setUsernameStatus("current");
            return;
        }

        const timeout = setTimeout(async () => {
            setUsernameStatus("checking");
            const result = await checkUsernameAvailability(userName);
            if (result.isAvailable) {
                setUsernameStatus("available");
            } else {
                setUsernameStatus("taken");
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [userName, originalUsername]);

    // ---------------- IMAGE STATE ----------------
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [photoURL, setPhotoURL] = useState<string>("");

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("currentUser") || "{}");
        if (stored?.photoURL) setPhotoURL(stored.photoURL);
    }, []);

    // ---------------- IMAGE HANDLERS ----------------
    const handleOpenFile = () => fileInputRef.current?.click();

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
    };

    const onCropComplete = useCallback((_: any, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const getCroppedImg = async (): Promise<Blob> => {
        const image = new Image();
        image.src = imageSrc!;
        await new Promise((resolve) => (image.onload = resolve));

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx?.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob!), "image/jpeg");
        });
    };

    const uploadToCloudinary = async (blob: Blob) => {
        const formData = new FormData();
        formData.append("file", blob);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: "POST", body: formData }
        );

        const data = await res.json();
        return data.secure_url;
    };

    const handleSave = async () => {
        try {
            await updateUserProfileData({
                name,
                username: userName,
                bio,
                email,
                photoURL
            });

            // optional: persist locally
            const existing = JSON.parse(localStorage.getItem("currentUser") || "{}");
            localStorage.setItem("currentUser", JSON.stringify({
                ...existing,
                displayName: name,
                username: userName,
                bio,
                email,
                photoURL
            }));

        } catch (e) {
            console.error("Failed to save profile:", e);
        }
    };

    const handleSaveCrop = async () => {
        if (!croppedAreaPixels) return;

        const blob = await getCroppedImg();

        // ✅ CLOSE MODAL IMMEDIATELY
        setImageSrc(null);

        // ✅ instant preview
        const tempURL = URL.createObjectURL(blob);
        setPhotoURL(tempURL);

        try {
            const cloudURL = await uploadToCloudinary(blob);

            await updateUserProfileData({
                name,
                username: userName,
                bio,
                email,
                photoURL: cloudURL
            });

            setPhotoURL(cloudURL);

            const existing = JSON.parse(localStorage.getItem("currentUser") || "{}");
            localStorage.setItem("currentUser", JSON.stringify({
                ...existing,
                photoURL: cloudURL
            }));

        } catch (e) {
            console.error(e);
        }
    };

    const handleRemove = async () => {
        const existing = JSON.parse(localStorage.getItem("currentUser") || "{}");

        setPhotoURL("");

        localStorage.setItem("currentUser", JSON.stringify({
            ...existing,
            photoURL: ""
        }));

        try {
            await updateUserProfileData({
                name,
                username: userName,
                bio,
                email,
                photoURL: ""
            });
        } catch (e) {
            console.error(e);
            setPhotoURL(existing.photoURL || "");
        }
    };

    return (
        <div className="space-y-8">
            {/* --- YOUR UI (UNCHANGED) --- */}
            <div>
                <h2 className="text-lg font-medium text-gray-800 dark:text-white">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Update your profile details and avatar.
                </p>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                        {photoURL ? (
                            <img src={photoURL} className="w-full h-full object-cover" />
                        ) : (
                            getInitials(name)
                        )}
                    </div>

                    <button onClick={handleOpenFile} className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>

                <div className="flex space-x-4">
                    <button onClick={handleOpenFile} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                        <span>Change avatar</span>
                    </button>

                    <button onClick={handleRemove} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        <span>Remove</span>
                    </button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            {/* --- FORM unchanged --- */}
            {/* FORM */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full name</label>
                    <input value={name} onChange={(e) => handleNameChange(e.target.value)}
                        className="block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm placeholder-gray-400 dark:placeholder-gray-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email address</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)}
                        className="block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm placeholder-gray-400 dark:placeholder-gray-500" />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                    <input value={userName} onChange={(e) => setUserName(e.target.value)}
                        className="block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm placeholder-gray-400 dark:placeholder-gray-500" />

                    {usernameStatus === "checking" && <p className="text-xs mt-1 text-gray-400">Checking...</p>}
                    {usernameStatus === "available" && <p className="text-xs mt-1 text-green-500">Username available</p>}
                    {usernameStatus === "taken" && <p className="text-xs mt-1 text-red-500">Username taken</p>}
                    {usernameStatus === "current" && <p className="text-xs mt-1 text-gray-400">This is your current username</p>}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                    <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)}
                        className="block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm placeholder-gray-400 dark:placeholder-gray-500 resize-none" />
                </div>

            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 active:scale-95 transition-all duration-150"
                >
                    Save changes
                </button>
            </div>

            {/* 🔥 CROP MODAL (ADDED BACK — FUNCTIONALITY FIX) */}
            {imageSrc && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-[90%] max-w-lg">

                        <div className="relative w-full h-64">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => setImageSrc(null)}
                                className="px-4 py-2 bg-gray-500 text-white rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSaveCrop}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Save Crop
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}