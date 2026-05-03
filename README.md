#  ExpenseSplit – Smart Bill Splitting with Receipt Scan

##  Overview

**ExpenseSplit** is a smart bill-splitting application that simplifies group expense management. Instead of manually calculating who owes what, users can simply upload a photo of a restaurant receipt. The app uses AI-powered OCR to extract items and prices, allowing users to assign items to individuals and automatically calculate the final split including tax and tip.

---

##  Problem Statement

Splitting bills manually after a group dinner is often confusing, time-consuming, and prone to errors. ExpenseSplit solves this problem by automating the entire process with accuracy and ease.

---

##  Features

*  **Receipt Scanning (OCR)**
  Extracts item names and prices from uploaded receipt images using Optical Character Recognition.

*  **Itemized Bill Splitting**
  Assign specific items to individuals (e.g., "John had Pizza").

*  **Automatic Tax & Tip Calculation**
  Calculates the exact amount each person owes, including tax and tip.

*  **Shareable Summary**
  Generate a shareable link with a detailed breakdown for all participants.

*  **Drag & Drop Interface**
  Easily assign items to users with an intuitive UI.

---

##  Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js
* **OCR Engine:** Tesseract.js

---

##  Project Structure

```
ExpenseSplit/
│
├── frontend/        # React app
├── backend/         # Node.js server
├── uploads/         # Stored receipt images
├── utils/           # OCR & calculation logic
└── README.md
```

---

## ⚙️ Installation & Setup

### 1 Clone the Repository

```bash
git clone https://github.com/your-username/ExpenseSplit.git
cd ExpenseSplit
```

### 2️ Setup Backend

```bash
cd backend
npm install
npm start
```

### 3️ Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

---

## : Usage

1. Upload a photo of a receipt 
2. Let the app extract items automatically
3. Add people to the group 
4. Assign items to individuals using drag & drop
5. View the final split with tax & tip included 
6. Share the summary link 

---

##  Screenshots 

Screenshots here later

---

##  Contributing

Contributions are welcome!
If you'd like to improve this project:

1. Fork the repository
2. Create a new branch (`feature/your-feature`)
3. Commit your changes
4. Submit a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

##  Author

Null 

---

##  Future Improvements

* Mobile app version 
* Real-time collaboration
* Multi-currency support
* AI-based receipt error correction
* Group chats

---

 If you like this project, don’t forget to star the repository!
