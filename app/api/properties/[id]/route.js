import connectToDB from "@/app/config/database";
import Property from "@/app/models/Property";
export const GET = async (req, { params }) => {
    const { id } = await params;
//   return new Response("Hello from the properties API route!");
try{
    await connectToDB();
    const property = await Property.findById(id);
    if(!property){
        return new Response(JSON.stringify({ message: "Property not found" }), {
            status: 404,
        });
    }
    return new Response(JSON.stringify(property), {
        status: 200,
    });
}
catch (error) {
    console.error("Error fetching properties:", error);
    return new Response(JSON.stringify({ message: "Error fetching properties" }), {
        status: 500,
    });

}
}