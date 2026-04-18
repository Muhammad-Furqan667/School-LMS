import { SchoolService } from './src/services/schoolService';

async function main() {
  try {
    const students = await SchoolService.getStudents();
    const studentsSummary = students.map(s => ({ id: s.id, name: s.name, class_id: s.class_id, grade: s.classes?.grade }));
    
    const classes = await SchoolService.getClasses();
    const classesSummary = classes.map(c => ({ id: c.id, grade: c.grade, section: c.section, year_id: c.academic_year_id }));
    
    console.log('STUDENTS:', JSON.stringify(studentsSummary, null, 2));
    console.log('CLASSES:', JSON.stringify(classesSummary, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
