# Copy editor utility

This is a utility that allows someone to write or paste words in a rich-text format, attempts to interpret what is written and converts it into a JSON representation of the text. The JSON will be an array, containing an object representing each paragraph. Each object is of the form:

```
{
    "content": [
        {
            "style": "normal",
            "content": "Hello, world!"
        }
    ]
}
```

i.e. the object should contain a single key, ```content```, whose value is an array containing 1). the text (value of the child ```content``` key), and 2). the style to be applied to that text. The styles may be "normal", "bold", "italic", or "bold-italic".

For example, the text:

> **Happy 2021.** Hope _you_ have a wonderful year ahead!
> 
> Hope to see you soon.

Would have the JSON representation:

```
[
  {
    "content": [
      {
        "style": "bold",
        "content": "Happy 2021."
      },
      {
        "style": "normal",
        "content": " Hope "
      },
      {
        "style": "italic",
        "content": "you"
      },
      {
        "style": "normal",
        "content": " have a wonderful year ahead!"
      }
    ]
  },
  {
    "content": [
      {
        "style": "normal",
        "content": "Hope to see you soon."
      }
    ]
  }
]
```

## The problem

We have taken a first pass at parsing input text into this JSON format. But it is quite fragile. Occassionally, when copy/pasting text into the text box, our parsing logic cannot extract the text in the HTML that is copied, which results in skipping over a block of text entirely.

Is there a way to make parsing incoming pasted text more robust? Such that I can copy/paste text written in a Google Doc, or from a website, have the parsing logic be able to extract the text I pasted, along with a reasonable guess as to whether the texts hould be bolded, italicized, etc?


## To run

Clone this repository, and install dependencies:
```
npm i
```

and run the app locally:
```
npm start
```

and visit 
```
http://localhost:8000/
```
