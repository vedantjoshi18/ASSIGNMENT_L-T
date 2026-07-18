let students = [
    { name: "Vedant Joshi", marks: 85 },
    { name: "Yugank Rathore", marks: 92 },
    { name: "Samuel Biju", marks: 78 },
    { name: "Aarush Kumar", marks: 88 }
];
students.pop();
students.sort((a, b) => a.marks - b.marks);
for (let i = 0; i < students.length; i++) {
    console.log(students[i].name + ": " + students[i].marks);
}
// Samuel Biju: 78
// Vedant Joshi: 85
// Aarush Kumar: 88
