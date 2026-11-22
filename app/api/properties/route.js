import connectToDB from "@/config/database";
import Property from "@/models/Property";
export const GET = async () => {
//   return new Response("Hello from the properties API route!");
try{
    await connectToDB();
    const properties = await Property.find({});
    return new Response(JSON.stringify(properties), {
    status: 200,
})
}
catch (error) {
    console.error("Error fetching properties:", error);
    return new Response(JSON.stringify({ message: "Error fetching properties" }), {
        status: 500,
    });

}
}