const STORAGE_KEY = "BOOKSHELF_APP"
let books = []

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage")
    return false
  }
  return true
}

function loadBooksFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY)
  if (serializedData !== null) {
    books = JSON.parse(serializedData)
  }
  document.dispatchEvent(new Event("booksChanged"))
}

function saveBooksToStorage() {
  if (isStorageExist()) {
    const serializedData = JSON.stringify(books)
    localStorage.setItem(STORAGE_KEY, serializedData)
    document.dispatchEvent(new Event("booksChanged"))
  }
}

function generateId() {
  return +new Date()
}

function createBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year, isComplete }
}

function findBook(bookId) {
  return books.find((book) => book.id === bookId)
}

function findBookIndex(bookId) {
  return books.findIndex((book) => book.id === bookId)
}

function renderBooks() {
  const incompleteBookList = document.getElementById("incompleteBookList")
  const completeBookList = document.getElementById("completeBookList")

  incompleteBookList.innerHTML = ""
  completeBookList.innerHTML = ""

  for (let book of books) {
    const bookElement = createBookElement(book)
    if (book.isComplete) {
      completeBookList.append(bookElement)
    } else {
      incompleteBookList.append(bookElement)
    }
  }
}

function createBookElement({ id, title, author, year, isComplete }) {
  const bookTitle = document.createElement("h3")
  bookTitle.innerText = title
  bookTitle.setAttribute("data-testid", "bookItemTitle")

  const bookAuthor = document.createElement("p")
  bookAuthor.innerText = `Penulis: ${author}`
  bookAuthor.setAttribute("data-testid", "bookItemAuthor")

  const bookYear = document.createElement("p")
  bookYear.innerText = `Tahun: ${year}`
  bookYear.setAttribute("data-testid", "bookItemYear")

  const bookContainer = document.createElement("div")
  bookContainer.setAttribute("data-bookid", id)
  bookContainer.setAttribute("data-testid", "bookItem")
  bookContainer.append(bookTitle, bookAuthor, bookYear)

  const actionContainer = document.createElement("div")

  const toggleButton = document.createElement("button")
  toggleButton.innerText = isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca"
  toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton")
  toggleButton.addEventListener("click", () => {
    toggleBookCompletion(id)
  })

  const deleteButton = document.createElement("button")
  deleteButton.innerText = "Hapus Buku"
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton")
  deleteButton.addEventListener("click", () => {
    removeBook(id)
  })

  const editButton = document.createElement("button")
  editButton.innerText = "Edit Buku"
  editButton.setAttribute("data-testid", "bookItemEditButton")
  editButton.addEventListener("click", () => {
    populateEditForm(id)
  })

  actionContainer.append(toggleButton, deleteButton, editButton)
  bookContainer.append(actionContainer)

  return bookContainer
}

function toggleBookCompletion(bookId) {
  const book = findBook(bookId)
  if (book) {
    book.isComplete = !book.isComplete
    saveBooksToStorage()
  }
}

function removeBook(bookId) {
  const bookIndex = findBookIndex(bookId)
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1)
    saveBooksToStorage()
  }
}

function addBook() {
  const titleInput = document.getElementById("bookFormTitle")
  const authorInput = document.getElementById("bookFormAuthor")
  const yearInput = document.getElementById("bookFormYear")
  const isCompleteInput = document.getElementById("bookFormIsComplete")

  const editingId = document
    .getElementById("bookForm")
    .getAttribute("data-editing-id")

  if (editingId) {
    // Jika sedang mengedit buku
    const bookIndex = findBookIndex(Number(editingId))
    if (bookIndex !== -1) {
      books[bookIndex] = {
        ...books[bookIndex],
        title: titleInput.value,
        author: authorInput.value,
        year: Number(yearInput.value),
        isComplete: isCompleteInput.checked,
      }
      document.getElementById("bookForm").removeAttribute("data-editing-id") // Hapus mode edit
    }
  } else {
    // Menambahkan buku baru
    const newBook = createBookObject(
      generateId(),
      titleInput.value,
      authorInput.value,
      Number(yearInput.value),
      isCompleteInput.checked
    )
    books.push(newBook)
  }

  saveBooksToStorage()
  resetForm()
}

function populateEditForm(bookId) {
  const book = findBook(bookId)
  if (!book) return

  document.getElementById("bookFormTitle").value = book.title
  document.getElementById("bookFormAuthor").value = book.author
  document.getElementById("bookFormYear").value = book.year
  document.getElementById("bookFormIsComplete").checked = book.isComplete

  document.getElementById("bookForm").setAttribute("data-editing-id", bookId)
}

function searchBooks(query) {
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(query.toLowerCase())
  )
  renderSearchResults(filteredBooks)
}

function renderSearchResults(searchResults) {
  const incompleteBookList = document.getElementById("incompleteBookList")
  const completeBookList = document.getElementById("completeBookList")

  incompleteBookList.innerHTML = ""
  completeBookList.innerHTML = ""

  for (let book of searchResults) {
    const bookElement = createBookElement(book)
    if (book.isComplete) {
      completeBookList.append(bookElement)
    } else {
      incompleteBookList.append(bookElement)
    }
  }
}

function resetForm() {
  const titleInput = document.getElementById("bookFormTitle")
  const authorInput = document.getElementById("bookFormAuthor")
  const yearInput = document.getElementById("bookFormYear")
  const isCompleteInput = document.getElementById("bookFormIsComplete")

  titleInput.value = ""
  authorInput.value = ""
  yearInput.value = ""
  isCompleteInput.checked = false
}

document
  .getElementById("bookForm")
  .addEventListener("submit", function (event) {
    event.preventDefault()
    addBook()
  })

document
  .getElementById("searchBook")
  .addEventListener("submit", function (event) {
    event.preventDefault()
    const searchInput = document.getElementById("searchBookTitle").value
    searchBooks(searchInput)
  })

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadBooksFromStorage()
  }
})

document.addEventListener("booksChanged", renderBooks)
