package com.liuzixuan.base.serializable;

import java.io.*;
import java.text.MessageFormat;

/**
 * @Description
 * @Author liuzixuan
 * @Date 2021/6/15 15:35
 */
public class SerializableTest {
    public static void main(String[] args) throws Exception {
        /**序列化Person对象**/
        SerializePerson();
        /**在反序列之前，修改静态变量，反序列后值为修改之后的**/
        Person.name = "dsa";
        /**反序列Perons对象**/
        Person p = DeserializePerson();
        System.out.println(MessageFormat.format("name={0},age={1},sex={2}", p.getName(), p.getAge(), p.getSex()));
    }

    /**
     * Description: 序列化Person对象
     */
    private static void SerializePerson() throws FileNotFoundException,
            IOException {
        Person person = new Person();
        person.setName("gacl");
        person.setAge(100);
        person.setSex("男");
        /** ObjectOutputStream 对象输出流，将Person对象存储到E盘的Person.txt文件中，完成对Person对象的序列化操作 **/
        ObjectOutputStream oo = new ObjectOutputStream(new FileOutputStream(
                new File("D:/Person.txt")));
        oo.writeObject(person);
        System.out.println("Person对象序列化成功！");
        oo.close();
    }

    /**
     * Description: 反序列Perons对象
     */
    private static Person DeserializePerson() throws FileNotFoundException, IOException, ClassNotFoundException {
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream(
                new File("D:/Person.txt")));
        Person person = (Person) ois.readObject();
        System.out.println("Person对象反序列化成功！");
        return person;
    }
}

    class Person implements Serializable {


        private static final long serialVersionUID = -2177963966836370667L;
        private transient int age;
        public static String name;
        private String sex;


        public int getAge() {
            return age;
        }

        public String getName() {
            return name;
        }

        public String getSex() {
            return sex;
        }

        public void setAge(int age) {
            this.age = age;
        }

        public void setName(String name) {
            name = name;
        }

        public void setSex(String sex) {
            this.sex = sex;
        }
    }

