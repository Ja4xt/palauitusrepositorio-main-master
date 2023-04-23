import { useState, useEffect } from "react";
import Filter from "./komponentit/Filter";
import PersonForm from "./komponentit/PersonForm";
import Persons from "./komponentit/Persons";
import personService from "./palvelut/persons";
import Notification from "./komponentit/Notification";

/*
JM fullstackopen 2023 
puhelinluettelo
*/

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newPerson, setNewPerson] = useState({ name: "", number: "" });
  const [filter, setFilter] = useState("");
  const [personsToShow, setPersonsToShow] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
      setPersonsToShow(initialPersons);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage(null);
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  const addPerson = (event) => {
    event.preventDefault();
    const currentName = persons.filter(
      (person) => person.name === newPerson.name
    );

    if (currentName.length === 0) {
      personService
        .create(newPerson)
        .then((returnedPerson) => {
          setPersons(persons.concat(returnedPerson));
          setPersonsToShow(persons.concat(returnedPerson));
          setMessage(`Added ${newPerson.name} to phonebook`);
        })
        .catch((error) => setMessage(error.response.data.error));
    } else {
      if (
        window.confirm(
          `${newPerson.name} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        personService
          .update(currentName[0].id, newPerson)
          .then((returnedPerson) => {
            const updatedPersons = persons.map((person) =>
              person.id !== returnedPerson.id ? person : returnedPerson
            );
            setPersons(updatedPersons);
            setPersonsToShow(updatedPersons);
            setMessage(`Updated ${newPerson.name}'s number`);
          })
          .catch((error) => setMessage(error.response.data.error));
      }
    }
    setNewPerson({ name: "", number: "" });
  };

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService.remove(id).then((response) => {
        const updatedPersons = persons.filter((person) => person.id !== id);
        setPersons(updatedPersons);
        setPersonsToShow(updatedPersons);
        setMessage(`Removed ${name} from phonebook`);
      });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewPerson({ ...newPerson, [name]: value });
  };

  const filterByName = (event) => {
    const search = event.target.value;
    setFilter(search);
    setPersonsToShow(
      persons.filter((person) => person.name.toLowerCase().includes(search))
    );
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} />
      <Filter filter={filter} filterByName={filterByName} />
      <h2>add a new</h2>
      <PersonForm
        addPerson={addPerson}
        newPerson={newPerson}
        handleChange={handleChange}
      />
      <h2>Numbers</h2>
      <Persons personsToShow={personsToShow} deletePerson={deletePerson} />
    </div>
  );
};

export default App;