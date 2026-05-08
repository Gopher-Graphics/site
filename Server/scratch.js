async function test() {
  try {
    const response = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username_raw: "wrong", password: "wrong" })
    });
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch(e) {
      json = {};
    }
    if (!response.ok) {
      throw new Error(json.error || `Status ${response.status}`);
    }
    console.log("Success", json);
  } catch (err) {
    console.log("Caught:", err.message);
  }
}
test();
