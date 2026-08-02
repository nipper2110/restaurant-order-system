import "dotenv/config";

import { app } from "./app";

const PORT = process.env.PORT || 4000;

app.listen(8080, () =>
  console.log(`Server ready at: http://localhost:${PORT}`),
);
