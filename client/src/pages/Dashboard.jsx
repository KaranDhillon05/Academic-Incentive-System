import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  Assignment as ProjectIcon,
  MenuBook as JournalIcon
} from '@mui/icons-material';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import ExcelDownload from '../components/ExcelDownload';

const Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [books, setBooks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [booksRes, projectsRes, journalsRes] = await Promise.all([
          axios.get('/api/books'),
          axios.get('/api/projects'),
          axios.get('/api/journals')
        ]);

        setBooks(booksRes.data.data);
        setProjects(projectsRes.data.data);
        setJournals(journalsRes.data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`/api/${type}/${id}`);

        // Update state based on type
        if (type === 'books') {
          setBooks(books.filter(book => book._id !== id));
        } else if (type === 'projects') {
          setProjects(projects.filter(project => project._id !== id));
        } else if (type === 'journals') {
          setJournals(journals.filter(journal => journal._id !== id));
        }
      } catch (err) {
        console.error('Error deleting entry:', err);
        setError('Failed to delete entry. Please try again.');
      }
    }
  };

  const renderSummary = () => {
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BookIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{books.length}</Typography>
                  <Typography variant="subtitle1">Book Publications</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ProjectIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{projects.length}</Typography>
                  <Typography variant="subtitle1">Funded Projects</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <JournalIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{journals.length}</Typography>
                  <Typography variant="subtitle1">Journal Publications</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderBooksTable = () => {
    return (
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Book Publications</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/books/new')}
          >
            Add Book
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Publisher</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Publication Date</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.length > 0 ? (
              books.map((book) => (
                <TableRow key={book._id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.publisher}</TableCell>
                  <TableCell>{book.type}</TableCell>
                  <TableCell>{new Date(book.publicationDate).toLocaleDateString()}</TableCell>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => navigate(`/books/${book._id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('books', book._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No book publications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderProjectsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Funded Projects</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/new')}
          >
            Add Project
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Funding Agency</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Grant Date</TableCell>
              <TableCell>Grant Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{project.fundingAgency}</TableCell>
                  <TableCell>{project.role}</TableCell>
                  <TableCell>{new Date(project.grantDate).toLocaleDateString()}</TableCell>
                  <TableCell>₹{project.grantAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => navigate(`/projects/${project._id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('projects', project._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No funded projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderJournalsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Journal Publications</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/journals/new')}
          >
            Add Journal
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paper Title</TableCell>
              <TableCell>Journal Name</TableCell>
              <TableCell>Author Level</TableCell>
              <TableCell>Published Date</TableCell>
              <TableCell>ISSN</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {journals.length > 0 ? (
              journals.map((journal) => (
                <TableRow key={journal._id}>
                  <TableCell>{journal.paperTitle}</TableCell>
                  <TableCell>{journal.journalName}</TableCell>
                  <TableCell>{journal.authorLevel}</TableCell>
                  <TableCell>{new Date(journal.publishedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{journal.issn}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => navigate(`/journals/${journal._id}`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('journals', journal._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No journal publications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome, {user?.name}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderSummary()}

      {/* Excel Download Section - Only visible to admins */}
      {user?.role === 'admin' && (
        <>
          <ExcelDownload />
          <Divider sx={{ my: 4 }} />
        </>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Books" />
          <Tab label="Projects" />
          <Tab label="Journals" />
        </Tabs>
      </Paper>

      {tabValue === 0 && renderBooksTable()}
      {tabValue === 1 && renderProjectsTable()}
      {tabValue === 2 && renderJournalsTable()}
    </Box>
  );
};

export default Dashboard;
