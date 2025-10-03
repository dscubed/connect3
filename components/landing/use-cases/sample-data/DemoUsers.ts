export interface UserDetails {
  user_id: string;
  name: string;
  avatar?: string;
  status: string;
  location: string;
}

export const demoUsers: Record<string, UserDetails> = {
  "81cba4a3-a014-40a1-9417-f236ce967112": {
    user_id: "81cba4a3-a014-40a1-9417-f236ce967112",
    name: "DSCubed",
    avatar: "/demo5.jpg",
    status:
      "All about data science at the heart of the University of Melbourne",
    location: "Melbourne, Australia",
  },
  "f2d127bb-17de-4179-84af-0c008fddcdde": {
    user_id: "f2d127bb-17de-4179-84af-0c008fddcdde",
    name: "Data Science Club of UWA",
    avatar: "/demo4.jpg",
    status:
      "UWA students looking to take advantage of the power of Data to innovate and make positive impact in society.",
    location: "Melbourne, Australia",
  },
  "ff398304-6947-4c6f-8144-5fe0f12c8cce": {
    user_id: "ff398304-6947-4c6f-8144-5fe0f12c8cce",
    name: "Ian Oon",
    avatar: "/demo2.png",
    status: "President @ UWA DSC | Robotics Engineering & Data Science @ UWA",
    location: "Perth, Australia",
  },
  "68376462-a2b2-4127-9453-05c729d0f66d": {
    user_id: "68376462-a2b2-4127-9453-05c729d0f66d",
    name: "Michael Ren",
    avatar: "/demo1.jpg",
    status:
      "Former SWE Intern @ Microsoft | Ex-President @ DSCubed | CS @ Unimelb",
    location: "Melbourne, Australia",
  },
  "8a4d0b82-668d-42aa-8c94-cafc7d2ca686": {
    user_id: "8a4d0b82-668d-42aa-8c94-cafc7d2ca686",
    name: "Tanat Chanwangsa",
    avatar: "/demo3.jpg",
    status: "Computer Science @ Unimelb | IT Director @ DSCubed",
    location: "Melbourne, Australia",
  },
};
