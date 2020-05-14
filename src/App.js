import React, {useEffect,useState} from 'react';
import {AppBar,Tab,Badge,TextField,Tabs,FormControlLabel,CircularProgress,CssBaseline,Typography,Container,Button,Chip, Checkbox} from '@material-ui/core';
import JokeCard from './JokeCard';

function Spinner() {
  return (
    <div style={{textAlign:'center',padding: '2rem'}}>
      <CircularProgress/>
    </div>
  )
}
function App() {
 const[jokes,setJokes] = useState([]);
 const[jokesToshow,setJokesToShow] = useState([]);
 const[likedJokes,setLikedJokes] = useState([]);
 const[currentTab,setCurrentTab] = useState(0);
 const[loading,setLoading] = useState(false);
const[categories,setCategories] = useState([]);
const[filterCategories,setFilterCategories] = useState([]);
const[firstName,setFirstName] = useState('');
const[lastName,setLastName] = useState('');

const handleSubmit = () => {
  if(firstName === '' || lastName === '') return false
}
  const likeJoke = id => {
    if(likedJokes.find(i => i.id === id)) return;
    const likedJoke = jokes.find(i => i.id === id)
    setLikedJokes([likedJoke,...likedJokes])
  }

  const toggleCategory = (event) => {
    const category = event.target.name;
    if(filterCategories.includes(category)){
      const filterCategoriesCopy = [...filterCategories];
      const categoryIndex = filterCategoriesCopy.indexOf(category);
      filterCategoriesCopy.splice(categoryIndex,1);
      setFilterCategories(filterCategoriesCopy)
    } else {
      setFilterCategories([...filterCategories,category]);
    }
  }
  const unlikeJoke = id => {
    setLikedJokes(likedJokes.filter(i => i.id !== id));
  }

  const changeTab = (e,value) => {
    setCurrentTab(value)
  }

  useEffect(() => {
    fetch('https://api.icndb.com/jokes')
    .then(res => res.json())
    .then(res =>{ 
      setJokes(res.value);
      setJokesToShow(res.value.slice(0,9));
      observer()
    }
    )
    .catch(err => console.log(err));
    fetch('https://api.icndb.com/categories')
    .then(res => res.json())
    .then(res =>{ 
      setCategories(res.value);
      setFilterCategories(res.value)
    }).catch(err => console.log(err))
  },[] );

  function addMoreJokes() {
    setLoading(true);
    setTimeout(() => {
      setJokesToShow(jokes.slice(0,jokesToshow.length+10));
      setLoading(false);
    },400);
  }

  function categoryMatch(category) {
    for(let i=0;i<category.length;i++) {
      if(filterCategories.includes(category[i])) return true
    }
    return false
  }
  function observer(bottomJokeElem) {
    if(bottomJokeElem == null) return;
   const observer = new IntersectionObserver((entries) => {
     if(entries[0].isIntersecting === true){
       addMoreJokes();
       observer.unobserve(bottomJokeElem);
     }
   },{
     threshold: 1
   })
   observer.observe(bottomJokeElem);
  }

  useEffect(() => {
     const bottomJokeElem = document.getElementById(`joke-${jokesToshow.length -1 }`);
     observer(bottomJokeElem);
  },[jokesToshow]);

  return (
    <div className="App">
      <CssBaseline/>
      <Container>
      <Typography variant="h2" align="center" style={{margin: 20}}>
        Chuck Norris Jokes
      </Typography>
      <AppBar style={{marginBottom: 20}} position="sticky">
        <Tabs value={currentTab} onChange={changeTab} centered>
          <Tab label="Home" id="home-tab" aria-controls="home-panel"/>
          <Tab label={
            <Badge color="secondary" badgeContent={likedJokes.length > 0 ? likedJokes.length : null}>Like</Badge>
          } id="like-tab" aria-controls="like-panel"/>
        </Tabs>
      </AppBar>
      <div role="tabpanel" hidden={currentTab !== 0}>
        <form noValidate onSubmit={handleSubmit}>
          <TextField id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
          <TextField id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)}/>

        </form>
        {categories.map(category => 
        <FormControlLabel key={category} control={<Checkbox name={category} onChange={toggleCategory} checked={filterCategories.includes(category)} color="primary"/>} 
        label={category} 
        />
          )}
      {jokesToshow.map((joke,index) => {
        if(joke.categories.length === 0 || categoryMatch(joke.categories)){
        return (<JokeCard joke={joke} key={joke.id} 
        likeJoke={likeJoke} unlikeJoke={unlikeJoke} index={index}/>)
        }
      })}
      {loading && <Spinner/>}
        </div>
        
          <div role="tabpanel" hidden={currentTab !== 1}>
          {likedJokes.map(joke => 
         <JokeCard joke={joke} key={joke.id} likeJoke={likeJoke} unlikeJoke={unlikeJoke}/>
         )}
          </div>
      </Container>
    </div>
  );
}

export default App;
