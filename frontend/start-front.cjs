const { exec } = require("child_process");

exec("npx serve -s dist -l 0.0.0.0:80", (err, stdout, stderr) => {
  if (err) {
    console.error("Erro ao iniciar o frontend:", err);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});

