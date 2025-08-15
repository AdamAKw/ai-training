print("Hello from init script");
rs.initiate({
  _id: "dbrs",
  members: [
    {
      _id: 0,
      host: "db:27017"
    }
  ]
});