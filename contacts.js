const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const { argv } = require("./line-command");
const { errorMessage, successMessage } = require("./message");

class Contacts {
  constructor(action, id, name, email, phone) {
    this.action = action;
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
  }

  readContent = async () => {
    try {
      const content = await fs.readFile(
        path.join(__dirname, "db", "contacts.json"),
        "utf8"
      );
      const result = JSON.parse(content);
      return result;
    } catch (err) {
      console.error(err.message);
    }
  };

  listContacts = async () => {
    try {
      const contacts = await this.readContent();
      if (contacts === void 0) {
        throw Error("Contacts list is empty.");
      }
      console.table(contacts);
    } catch (err) {
      console.error(errorMessage(`${err.message}`));
    }
  };

  getContactById = async (contactId) => {
    try {
      const contacts = await this.readContent();
      const [contactById] = contacts.filter(
        (contact) => contact.id === contactId
      );
      if (!contactById) {
        throw Error(`Contact with id: ${contactId} NOT found`);
      }
      console.log(successMessage(`Contact with id: ${contactId} found`));
      console.table(contactById);
    } catch (err) {
      console.error(errorMessage(`${err.message}`));
    }
  };

  removeContact = async (contactId) => {
    try {
      const contacts = await this.readContent();
      const isChecked = contacts.findIndex(({ id }) => id === contactId);

      if (isChecked === -1) {
        throw Error(`Contact with id: ${contactId} NOT FOUND`);
      }

      const filterContacts = contacts.filter(({ id }) => id !== contactId);
      await fs.writeFile(
        path.join(__dirname, "db", "contacts.json"),
        JSON.stringify(filterContacts, null, 2)
      );
      console.log(
        successMessage(
          `Contact with id: ${contactId} was successfully deleted !`
        )
      );
    } catch (err) {
      console.error(errorMessage(`${err.message}`));
    }
  };

  addContact = async (name, email, phone) => {
    try {
      const contacts = await this.readContent();
      const isCheck = contacts.forEach((contact) => {
        if (contact.name === name) {
          throw Error(
            `\nThis contact with name: "${name}" is exist in contacts list!!!`
          );
        } else if (contact.email === email) {
          throw Error(
            `\nThis contact with email: "${email}" is exist in contacts list!!!`
          );
        } else if (contact.phone === phone) {
          throw Error(
            `\nThis contact with phone: "${phone}" is exist in contacts list!!!`
          );
        }
      });
      if (!isCheck) {
        const newContact = { name, email, phone, id: crypto.randomUUID() };
        contacts.push(newContact);

        await fs.writeFile(
          path.join(__dirname, "db", "contacts.json"),
          JSON.stringify(contacts, null, 2)
        );
        console.log(successMessage("New contact was successfully added!"));
        console.table(newContact);
      }
    } catch (err) {
      console.error(errorMessage(`${err.message}`));
    }
  };

  invokeAction = async ({ action, id, name, email, phone }) => {
    switch (action) {
      case "list":
        await this.listContacts();
        break;

      case "get":
        await this.getContactById(id);
        break;

      case "add":
        await this.addContact(name, email, phone);
        break;

      case "remove":
        await this.removeContact(id);
        break;

      default:
        console.warn(errorMessage(" Unknown action type!"));
    }
  };

  init = () => {
    this.invokeAction(this.action, this.id, this.name, this.email, this.phone);
  };
}

module.exports = new Contacts(argv);
