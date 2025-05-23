import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsMj6w3dA02DfWpARzznHYFE0UW9hvR-g",
  authDomain: "myproject-1af12.firebaseapp.com",
  projectId: "myproject-1af12",
  storageBucket: "myproject-1af12.appspot.com",
  messagingSenderId: "281695354421",
  appId: "1:281695354421:web:dad453bdf8f0650901bb7c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tableBody = document.getElementById("adminTableBody");

async function loadBookings() {
  try {
    const querySnapshot = await getDocs(collection(db, "weddingBookings"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;

      const row = document.createElement("tr");
      const fullName = `${data.brideFname} ${data.brideLname} & ${data.groomFname} ${data.groomLname}`;
      const status = data.status || "Not Ready";

      row.innerHTML = `
        <td>${fullName}</td>
        <td>${docId}</td>
        <td><span class="status-text">${status}</span></td>
        <td>
          <button class="btn ${status === "Ready" ? "finished" : "not-finished"}" onclick="toggleStatus(this, '${docId}')">
            Mark as ${status === "Ready" ? "Not Ready" : "Ready"}
          </button>
        </td>
        <td>
          <button class="btn cancel-btn" onclick="deleteBooking('${docId}', this)">
            Cancel Booking
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading bookings:", error);
  }
}

window.toggleStatus = async function (button, id) {
  const row = button.closest("tr");
  const statusText = row.querySelector(".status-text");
  const currentStatus = statusText.textContent.trim();
  const newStatus = currentStatus === "Not Ready" ? "Ready" : "Not Ready";

  try {
    await updateDoc(doc(db, "weddingBookings", id), { status: newStatus });

    statusText.textContent = newStatus;
    button.textContent = `Mark as ${newStatus === "Ready" ? "Not Ready" : "Ready"}`;
    button.classList.toggle("finished", newStatus === "Ready");
    button.classList.toggle("not-finished", newStatus !== "Ready");

    // Optionally hide cancel button if now "Ready"
    const cancelBtn = row.querySelector(".cancel-btn");
    if (newStatus === "Ready") {
      cancelBtn.disabled = true;
      cancelBtn.style.opacity = 0.5;
    } else {
      cancelBtn.disabled = false;
      cancelBtn.style.opacity = 1;
    }

  } catch (error) {
    console.error("Failed to update status:", error);
    alert("Failed to update status.");
  }
};

window.deleteBooking = async function (id, button) {
  const row = button.closest("tr");
  const statusText = row.querySelector(".status-text").textContent.trim();

  if (statusText === "Ready") {
    alert("This booking is marked as 'Ready' and cannot be cancelled.");
    return;
  }

  if (confirm("Are you sure you want to cancel this booking?")) {
    try {
      await deleteDoc(doc(db, "weddingBookings", id));
      row.remove();
      alert("Booking cancelled.");
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
    }
  }
};

loadBookings();
