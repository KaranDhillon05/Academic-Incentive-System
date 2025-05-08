// Simple in-memory database for testing
const db = {
  users: [],
  books: [],
  projects: [],
  journals: []
};

let counters = {
  users: 1,
  books: 1,
  projects: 1,
  journals: 1
};

// User methods
const userMethods = {
  create: async (userData) => {
    const user = {
      _id: counters.users++,
      ...userData,
      createdAt: new Date()
    };
    db.users.push(user);
    console.log('User created:', user);
    return user;
  },
  
  findOne: async (query) => {
    if (query.email) {
      return db.users.find(user => user.email === query.email);
    }
    return null;
  },
  
  findById: async (id) => {
    return db.users.find(user => user._id == id);
  }
};

// Book methods
const bookMethods = {
  create: async (bookData) => {
    const book = {
      _id: counters.books++,
      ...bookData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.books.push(book);
    console.log('Book created:', book);
    return book;
  },
  
  find: (query = {}) => {
    let results = [...db.books];
    
    if (query.userId) {
      results = results.filter(book => book.userId == query.userId);
    }
    
    return {
      sort: (sortField) => {
        if (sortField === '-createdAt') {
          return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return results;
      }
    };
  },
  
  findById: async (id) => {
    return db.books.find(book => book._id == id);
  },
  
  findByIdAndUpdate: async (id, updateData, options) => {
    const index = db.books.findIndex(book => book._id == id);
    if (index === -1) return null;
    
    const updatedBook = {
      ...db.books[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    db.books[index] = updatedBook;
    return updatedBook;
  },
  
  deleteOne: async function(query) {
    if (query._id) {
      const index = db.books.findIndex(book => book._id == query._id);
      if (index !== -1) {
        db.books.splice(index, 1);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }
};

// Project methods
const projectMethods = {
  create: async (projectData) => {
    const project = {
      _id: counters.projects++,
      ...projectData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.projects.push(project);
    console.log('Project created:', project);
    return project;
  },
  
  find: (query = {}) => {
    let results = [...db.projects];
    
    if (query.userId) {
      results = results.filter(project => project.userId == query.userId);
    }
    
    return {
      sort: (sortField) => {
        if (sortField === '-createdAt') {
          return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return results;
      }
    };
  },
  
  findById: async (id) => {
    return db.projects.find(project => project._id == id);
  },
  
  findByIdAndUpdate: async (id, updateData, options) => {
    const index = db.projects.findIndex(project => project._id == id);
    if (index === -1) return null;
    
    const updatedProject = {
      ...db.projects[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    db.projects[index] = updatedProject;
    return updatedProject;
  },
  
  deleteOne: async function(query) {
    if (query._id) {
      const index = db.projects.findIndex(project => project._id == query._id);
      if (index !== -1) {
        db.projects.splice(index, 1);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }
};

// Journal methods
const journalMethods = {
  create: async (journalData) => {
    const journal = {
      _id: counters.journals++,
      ...journalData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.journals.push(journal);
    console.log('Journal created:', journal);
    return journal;
  },
  
  find: (query = {}) => {
    let results = [...db.journals];
    
    if (query.userId) {
      results = results.filter(journal => journal.userId == query.userId);
    }
    
    return {
      sort: (sortField) => {
        if (sortField === '-createdAt') {
          return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return results;
      }
    };
  },
  
  findById: async (id) => {
    return db.journals.find(journal => journal._id == id);
  },
  
  findByIdAndUpdate: async (id, updateData, options) => {
    const index = db.journals.findIndex(journal => journal._id == id);
    if (index === -1) return null;
    
    const updatedJournal = {
      ...db.journals[index],
      ...updateData,
      updatedAt: new Date()
    };
    
    db.journals[index] = updatedJournal;
    return updatedJournal;
  },
  
  deleteOne: async function(query) {
    if (query._id) {
      const index = db.journals.findIndex(journal => journal._id == query._id);
      if (index !== -1) {
        db.journals.splice(index, 1);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }
};

module.exports = {
  User: userMethods,
  Book: bookMethods,
  Project: projectMethods,
  Journal: journalMethods,
  db
};
