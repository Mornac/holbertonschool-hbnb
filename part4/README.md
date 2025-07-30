## **Part 4: Simple Web Client**  

This fourth part of the HBnB Project focuses on the front-end development of our appication.
My task is to design an implement an interactive user interface that connect with the back-end services developed in previous parts of HBnB project.  

### 📂 **Summary**
* [Technologies used](#technologies-used)
* [Objectives](#objectives)   
* [Learning objectives](#learning-objectives)  
* [Recommended Resources](#recommended-resources)  
* [Tasks](#tasks)  
* [Directory Structure](#directory-structure)
* [Screenshots](#screenshots)
* [Author](#author)

 -----


### **Technologies used**
<p align=center>
    <img src="doc_images/download.png" width="25%">
</p>  

### **Objectives**
1. Develop a user-friendly interface following provided design specifications.  
2. Implement client-side functionality to interact with the back-end API.  
3. Ensure secure and efficient data handling using JavaScript.  
4. Apply modern web development practices to create a dynamic web application.  

### **Learning objectives**
1. Understand and apply HTML5, CSS3, and JavaScript ES6 in a real-world project.
2. Learn to interact with back-end services using AJAX/Fetch API.
3. Implement authentication mechanisms and manage user sessions.
4. Use client-side scripting to enhance user experience without page reloads.  

### **Recommended Resources**
[HTML5 Documentation](https://developer.mozilla.org/en-US/docs/Glossary/HTML5)  
[CSS Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Tutorials)  
[JavaScript Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)  
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)  
[Responsive Web Design Basics](https://web.dev/articles/responsive-web-design-basics?hl=fr)  
[Handling Cookies in JavaScript](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)  
[Client-Side Form Validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation)  

### **Tasks**
#### 0. Design  
- Complete provided HTML and CSS files to match the given design specifications.  
- Create pages for Login, List of Places, Place Details, and Add Review.  

#### 1. Login  
- Implement login functionality using the back-end API.  
-  Store the JWT token returned by the API in a cookie for session management.  

#### 2. List of Places  
- Implement the main page to display a list of all places.  
- Fetch places data from the API and implement client-side filtering based on country selection.  
- Ensure the page redirects to the login page if the user is not authenticated.  

#### 3. Place Details  
- Implement the detailed view of a place.  
- Fetch place details from the API using the place ID.  
- Provide access to the add review form if the user is authenticated.  

#### 4. Add Review  
- Implement the form to add a review for a place.  
- Ensure the form is accessible only to authenticated users, redirecting others to the index page.  

### **Directory Structure**
```python
part4/
├── doc_images/
    ├── img_index.png
│   ├── img_place.png
│   ├── img_place_review.png
    ├── img_review.png
├── images/
│   ├── Create logo.png
│   ├── icon.png
│   ├── logo.png
├── add_review.html
├── index.html
├── login.html
├── place.html
├── README.md
├── scripts.js
├── styles.css
├── .gitignore
```

### **Screenshots**
Holberton purpose Index  
![proposition_index](https://github.com/Mornac/holbertonschool-hbnb/blob/main/part4/doc_images/img_index.png?raw=true)  

Holberton purpose Place  
![proposition_place](https://github.com/Mornac/holbertonschool-hbnb/blob/main/part4/doc_images/img_place.png?raw=true)  

Holberton purpose Place add review  
![proposition_place_review](https://github.com/Mornac/holbertonschool-hbnb/blob/main/part4/doc_images/img_place_review.png?raw=true)  

MHolberton purpose Review and Rating   
![proposition_review](https://github.com/Mornac/holbertonschool-hbnb/blob/main/part4/doc_images/img_review.png?raw=true)  


### **Author**
This part of the project was carried out by:  
[Ingrid Mornac](https://github.com/Mornac/)  

> Thanks  
> [Gwendal Minguy-Pèlerin](https://github.com/gwendalminguy/) my co-author of the previous parts of this project for his expertise and professionalism.  
We worked a lot, but it was in a positive spirit, with respect and fun! 