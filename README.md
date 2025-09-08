  


####  answer the following question-


#### 1) What is the difference between var, let, and const?
**var** একই নামের ভ্যারিয়েবল বারবার ডিক্লেয়ার করা যায়। হোইস্টিং (hoisting) এর কারণে ভ্যারিয়েবল টপে উঠে যায়।</br>
**let** একই ব্লকের মধ্যে একই নামের ভ্যারিয়েবল আবার ডিক্লেয়ার করা যায় না।
হোইস্টিং হয়, তবে ইনিশিয়ালাইজ না করা পর্যন্ত ব্যবহার করা যায় না  </br>
**const** একবার ভ্যালু অ্যাসাইন করলে পরে পরিবর্তন করা যায় না। অবজেক্ট বা অ্যারের কনটেন্ট পরিবর্তন করা যায়।

#### 2) What is the difference between map(), forEach(), and filter()? 
**map()** প্রত্যেকটা আইটেমের উপর কাজ করে এবং নতুন অ্যারে return করে। </br>**forEach()**প্রত্যেকটা আইটেমের উপর কাজ করে, কিন্তু কিছু return করে না। </br>**filter()**condition দিয়ে ফিল্টার করে নতুন অ্যারে return করে।যে আইটেমগুলো condition মিলে শুধু সেগুলো রাখে।</br>

#### 3) What are arrow functions in ES6?
ছোট আকারে function  লেখার একটা পদ্ধতি। function কীওয়ার্ড ব্যবহার করতে হয় না।

#### 4) How does destructuring assignment work in ES6?
object or array value সরাসরি আলাদা variable অ্যাসাইন করার শর্টকাট।

#### 5) Explain template literals in ES6. How are they different from string concatenation?

**template literals** Syntex (``) use করা হয়।	
সরাসরি একাধিক লাইনে লেখা যায়। </br>

**string concatenation** 
syntex প্লাস (+) অপারেটর use করা হয়।
প্রতিটি লাইনের শেষে + এবং \n যোগ করতে হয়