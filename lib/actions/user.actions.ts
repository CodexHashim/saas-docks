// 'use server';

// import { clerkClient } from "@clerk/nextjs/server";
// import { parseStringify } from "../utils";
// import { liveblocks } from "../liveblocks";

// export const getClerkUsers = async ({ userIds }: { userIds: string[]}) => {
//   try {
//     const { data } = await clerkClient().users.getUserList({
//       emailAddress: userIds,
//     });

//     const users = data.map((user) => ({
//       id: user.id,
//       name: `${user.firstName} ${user.lastName}`,
//       email: user.emailAddresses[0].emailAddress,
//       avatar: user.imageUrl,
//     }));

//     const sortedUsers = userIds.map((email) => users.find((user) => user.email === email));

//     return parseStringify(sortedUsers);
//   } catch (error) {
//     console.log(`Error fetching users: ${error}`);
//   }
// }

// export const getDocumentUsers = async ({ roomId, currentUser, text }: { roomId: string, currentUser: string, text: string }) => {
//   try {
//     const room = await liveblocks.getRoom(roomId);

//     const users = Object.keys(room.usersAccesses).filter((email) => email !== currentUser);

//     if(text.length) {
//       const lowerCaseText = text.toLowerCase();

//       const filteredUsers = users.filter((email: string) => email.toLowerCase().includes(lowerCaseText))

//       return parseStringify(filteredUsers);
//     }

//     return parseStringify(users);
//   } catch (error) {
//     console.log(`Error fetching document users: ${error}`);
//   }
// }
'use server';

import { clerkClient } from "@clerk/nextjs/server";
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    const validUserIds = userIds.filter(isValidEmail);

    if (!validUserIds.length) {
      throw new Error("Invalid email addresses provided");
    }

    const { data } = await clerkClient().users.getUserList({
      emailAddress: validUserIds,
    });

    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`,
      email: user.emailAddresses?.[0]?.emailAddress || '',
      avatar: user.imageUrl,
    }));

    const sortedUsers = validUserIds.map((email) => users.find((user) => user.email === email)).filter(Boolean);

    return parseStringify(sortedUsers);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching users: ${error.message}`);
    } else {
      console.error('Error fetching users:', error);
    }
    return parseStringify([]); // Return empty array on failure
  }
};

export const getDocumentUsers = async ({ roomId, currentUser, text }: { roomId: string; currentUser: string; text: string }) => {
  try {
    if (!isValidEmail(currentUser)) {
      throw new Error("Invalid current user email");
    }

    const room = await liveblocks.getRoom(roomId);

    const users = Object.keys(room.usersAccesses).filter((email) => email !== currentUser && isValidEmail(email));

    if (typeof text === 'string' && text.length > 0) {
      const lowerCaseText = text.toLowerCase();

      const filteredUsers = users.filter((email: string) =>
        email.toLowerCase().includes(lowerCaseText)
      );

      return parseStringify(filteredUsers);
    }

    return parseStringify(users);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error fetching document users: ${error.message}`);
    } else {
      console.error('Error fetching document users:', error);
    }
    return parseStringify([]); // Return empty array on failure
  }
};
