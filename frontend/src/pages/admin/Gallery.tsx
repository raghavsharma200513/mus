import React, { useState, useEffect } from "react";
import axios from "axios";

// Define interface for Gallery Entry
interface GalleryEntry {
  _id: string;
  number: string;
  image?: string;
}

// Define interface for Entry Data
interface EntryData {
  number: string;
  image: File | null;
}

const GalleryManagement: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<GalleryEntry | null>(null);
  const [entryData, setEntryData] = useState<EntryData>({
    number: "",
    image: null,
  });

  useEffect(() => {
    fetchGalleryEntries();
  }, []);

  const fetchGalleryEntries = async () => {
    try {
      const response = await axios.get<GalleryEntry[]>(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery/`
      );
      setGallery(response.data);
    } catch (error) {
      console.error("Failed to fetch gallery entries:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    setEntryData((prev) => ({
      ...prev,
      [name]: type === "file" ? (files ? files[0] : null) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(entryData).forEach((key) => {
      const typedKey = key as keyof EntryData;
      if (typedKey === "image" && entryData[typedKey]) {
        formData.append("image", entryData[typedKey] as File);
      } else {
        formData.append(key, entryData[typedKey] as string);
      }
    });

    try {
      const url = editingEntry
        ? `${import.meta.env.VITE_BACKEND_URL}/api/gallery/${editingEntry._id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/gallery/`;

      const method = editingEntry ? "put" : "post";

      await axios({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchGalleryEntries();
      resetForm();
    } catch (error) {
      console.error("Failed to save gallery entry:", error);
    }
  };

  const resetForm = () => {
    setEntryData({
      number: "",
      image: null,
    });
    setEditingEntry(null);
  };

  const handleEdit = (entry: GalleryEntry) => {
    setEditingEntry(entry);
    setEntryData({
      number: entry.number,
      image: null,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery/${id}`
      );
      fetchGalleryEntries();
    } catch (error) {
      console.error("Failed to delete gallery entry:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">
          {editingEntry ? "Edit Gallery Entry" : "Add Gallery Entry"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            name="number"
            value={entryData.number}
            onChange={handleInputChange}
            placeholder="Entry Number"
            className="w-full px-3 py-2 border rounded-md"
            required
          />

          <input
            type="file"
            name="image"
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            accept="image/*"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            {editingEntry ? "Update Entry" : "Add Entry"}
          </button>

          {editingEntry && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full mt-2 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Gallery Entries</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Number</th>
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gallery.map((entry) => (
                <tr key={entry._id} className="border-b">
                  <td className="px-4 py-2">{entry.number}</td>
                  <td className="px-4 py-2">
                    {entry.image && (
                      <img
                        src={import.meta.env.VITE_BACKEND_URL + entry.image}
                        alt={`Gallery entry ${entry.number}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GalleryManagement;
