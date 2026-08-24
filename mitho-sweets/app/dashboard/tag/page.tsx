"use client";
import apiClient from "@/axiosConfig";
import { useEffect, useState } from "react";
import MithoSweetsLoader from "@/components/Loader/MithoSweetsLoader";
import DataTable from "@/components/DataTable/DataTable";
import {
 useMantineTheme,
 Button,
 Pagination,
 TextInput,
 Group,
} from "@mantine/core";
import BreadCrumbs from "@/components/common/BreadCrumbs";
import { notifications } from "@mantine/notifications";
import { toast } from "@/components/common/Toast";


// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
 const [debouncedValue, setDebouncedValue] = useState<T>(value);


 useEffect(() => {
   const handler = setTimeout(() => {
     setDebouncedValue(value);
   }, delay);


   return () => {
     clearTimeout(handler);
   };
 }, [value, delay]);


 return debouncedValue;
}
//tag
interface Tag {
 id: number;
 name: string;
 slug: string;
}


export default function Page() {
 const [tags, setTags] = useState<Tag[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [totalPage, setTotalPage] = useState(1);
 const [currentPage, setCurrentPage] = useState(1);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingTag, setEditingTag] = useState<Tag | null>(null);
 const [name, setName] = useState("");
 const [searchTerm, setSearchTerm] = useState("");
 const debouncedSearchTerm = useDebounce(searchTerm, 500);


 const theme = useMantineTheme();


 const listTags = async () => {
   setLoading(true);
   setError("");
   try {
     const query = debouncedSearchTerm
       ? `/tags/?page=${currentPage}&name=${encodeURIComponent(debouncedSearchTerm)}`
       : `/tags/?page=${currentPage}`;
     const response = await apiClient.get(query);
     setTags(response.data.results || response.data);
     setTotalPage(response.data.total_pages || 1);
   } catch (err: any) {
     setError(err.response?.data?.detail || "Fetching tags failed");
   } finally {
     setLoading(false);
   }
 };


 const handleSave = async () => {
   if (!name) {
     notifications.show({ message: "Tag name is required", color: "red" });
     return;
   }
   try {
     if (editingTag) {
       await apiClient.put(`/tags/${editingTag.id}/`, { name });
       notifications.show({ message: "Tag updated successfully", color: "green" });
     } else {
       await apiClient.post("/tags/", { name });
       notifications.show({ message: "Tag created successfully", color: "green" });
     }
     setIsModalOpen(false);
     setEditingTag(null);
     setName("");
     listTags();
   } catch (err: any) {
     notifications.show({
       message: err.response?.data?.detail || "Failed to save tag",
       color: "red",
     });
   }
 };


 const handleEdit = (tag: Tag) => {
   setEditingTag(tag);
   setName(tag.name);
   setIsModalOpen(true);
 };


 const handleDelete = async (row: any) => {
   const deleteId = row.id;
   toast.confirm(`Are you sure you want to delete tag ${row.name}?`, async () => {
     try {
       await apiClient.delete(`/tags/${deleteId}/`);
       toast.success("Tag deleted successfully");
       listTags();
     } catch (err: any) {
       console.error("Delete error:", err.response || err);
       toast.error(err.response?.data?.detail || "Failed to delete tag");
     }
   });
 };


 useEffect(() => {
   listTags();
 }, [currentPage, debouncedSearchTerm]);


 const columns = [
   { title: "Name", dataIndex: "name", key: "name" },
   { title: "Slug", dataIndex: "slug", key: "slug" },
 ];


 if (loading) {
   return (
     <div className="min-h-screen items-center flex justify-center">
       <MithoSweetsLoader />
     </div>
   );
 }


 return (
   <div className="bg-white p-8 rounded-xl shadow-lg border max-w-72 md:max-w-96 lg:max-w-full overflow-x-auto relative">
     <div className="flex justify-between mb-4">
       <h1 className="text-2xl font-bold" style={{ color: theme.colors.brand[6] }}>
         Tags
       </h1>
       <div className="flex justify-end gap-1">
         <TextInput
           color="orange"
           placeholder="Enter Tag Name"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.currentTarget.value)}
         />
         <Button
           color="orange"
           onClick={() => {
             setEditingTag(null);
             setName("");
             setIsModalOpen(true);
           }}
         >
           Add Tag
         </Button>
       </div>
     </div>


     <BreadCrumbs
       currentTitle="Tags"
       items={[{ name: "Dashboard", href: "/dashboard" }]}
       className="hover:text-red-500 cursor-pointer py-2"
     />


     {error && <p className="text-red-500">{error}</p>}


     <div className="overflow-x-auto">
       <DataTable
         columns={columns}
         data={tags}
         handleEdit={handleEdit}
         handleDelete={handleDelete}
         isTagPage={true}
       />
     </div>


     <div className="flex mt-2 items-center justify-center">
       {totalPage >= 1 && (
         <Pagination
           value={currentPage}
           onChange={setCurrentPage}
           total={totalPage}
           radius="lg"
         />
       )}
     </div>


     {/* Custom Modal */}
     {isModalOpen && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
           <h2 className="text-xl font-semibold mb-4">
             {editingTag ? "Edit Tag" : "Create Tag"}
           </h2>
           <div className="space-y-4">
             <TextInput
               label="Name"
               value={name}
               onChange={(e) => setName(e.currentTarget.value)}
               required
             />
             <Group justify="flex-end" mt="md">
               <Button variant="default" onClick={() => setIsModalOpen(false)}>
                 Cancel
               </Button>
               <Button onClick={handleSave} color="orange">
                 {editingTag ? "Update" : "Create"}
               </Button>
             </Group>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}

