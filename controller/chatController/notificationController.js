let onlineUsers = [];
const addOnlineUser = (currentUser) => {
  if (currentUser._id && currentUser.socketId) {
    // Check if both _id and socketId exist
    const existingUserIndex = onlineUsers.findIndex(
      (user) => user._id === currentUser._id
    );
    if (existingUserIndex !== -1) {
      if (onlineUsers[existingUserIndex].socketId !== currentUser.socketId) {
        onlineUsers[existingUserIndex].socketId = currentUser.socketId;
      }
    } else {
      onlineUsers.push(currentUser);
    }
  } else {
    console.log("Both _id and socketId must be provided.");
  }
};

export default function NotificationContoller(io) {
  io.on("connection", (socket) => {
    socket.emit("me", socket.id);
    socket.on("sendId", (data) => {
      addOnlineUser(data);
      // currentUsers.push(data)
    });

    //remove online
    socket.on("removeUserOnline", (data) => {
      onlineUsers.filter((user) => user._id !== data.iduser);
    });

    //managing the online users
    socket.emit("getOnlineUsers", onlineUsers);

    //send message
    socket.on("sendData", ({ socketId, _id, recieverId }) => {
      const filtered = onlineUsers.find((user) => user._id === recieverId);
      console.log("your are sending to :" + filtered?.socketId);
      console.log(onlineUsers);
      io.to(filtered?.socketId).emit("notification", {
        msg: "this is from dilu",
      });
    });

    //send message
    socket.on("sendMessage", ({ recieverId, text, sender }) => {
      console.log(recieverId);

      console.log("reciever id is : " + recieverId);
      const filtered = onlineUsers.find((user) => user._id === recieverId);

      io.to(filtered?.socketId).emit("getMessage", {
        sender,
        recieverId,
        text,
      });
    });

    //manage typing....
    socket.on("typing", ({ recieverId, text }) => {
      const filtered = onlineUsers.find((user) => user._id === recieverId);
      if (filtered) {
        io.to(filtered.socketId).emit("getTyping", { msg: "Typing...", text });
      } else {
        console.log("User not found or offline.");
      }
    });

    //video chat
    socket.on("callUser", (data) => {
      console.log(data.userToCall);
      const filtered = onlineUsers.find((user) => user._id === data.userToCall);
      io.to(filtered?.socketId).emit("offer", data.signalData); // Emit the actual offer signal
      io.emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name,
      });
    });

    // answer the call
    socket.on("answerCall", (data) => {
      console.log("reched here awsome to see that");
      console.log("data To :" + data.to);
      io.to(data.to).emit("callAccepted", data.signal);
    });

    //camera off
    socket.on("cmeraoff", (data) => {
      console.log(data);
      console.log("cammera off reached how" + data.userToCall);
      const filtered = onlineUsers.find((user) => user._id === data.userToCall);
      io.to(filtered?.socketId).emit("cammeraOffCheck", data.signalData);
    });
    socket.on("cammeraOn", (data) => {
      console.log("Received track information:", data.newStream);
      console.log("user call is:", data.userToCall);
      const filtered = onlineUsers.find((user) => user._id === data.userToCall);
      io.to(filtered?.socketId).emit("cammeraOnCheck", {
        newStream: data.newStream,
      });
    });

    //video end
    socket.on("videoEnd", (data) => {
      const filtered = onlineUsers.find((user) => user._id === data.userToCall);
      io.to(filtered?.socketId).emit("endVideoCall", { msg: "end" });
    });

    //sending  the call stream
    socket.on("sendCalling", ({ recieverId, msg }) => {
      console.log(recieverId);
      console.log(msg);
      const filtered = onlineUsers.find((user) => user._id === recieverId);
      io.to(filtered?.socketId).emit("recieveCall", msg);
    });
  });
  return {
    myFunction(req, res) {
      io.on("connection", (socket) => {
        console.log("a user is connected");
      });
    },
  };
}
