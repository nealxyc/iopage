---
layout: post
tags: java maven
comment: gist raw https://gist.githubusercontent.com/nealxyc/96267110f5156ac2ab12/raw/842813a57e1fd899bba925198fc632d3309b21f5/how-to-use-a-github-reposiroty-as-maven-repository.md
---
### 1. Create a dedicated project to host your Maven repository on Github
For example, you can have a `mvn-repo` project created.

### 2. Clone the remote `mvn-repo` into your local folder
For example, into `~/workspace/mvn-repo` folder

### 3. Build your project and deploy it into your local folder.
In order to do this, you will need to have the following snippet in your `pom.xml` file

```xml
<distributionManagement>
		<repository>
			<id>internal.repo</id>
			<name>Github Repo</name>
			<url>file:///path/to/mvn-repo</url>
		</repository>
</distributionManagement>

<plugins>
  <plugin>
      <artifactId>maven-deploy-plugin</artifactId>
      <version>2.8.1</version>
      <configuration>
          <altDeploymentRepository>internal.repo::default::file:///path/to/mvn-repo</altDeploymentRepository>
      </configuration>
  </plugin>
</plugins>
```
If you already have a `<distributionManagement>` tag in you `pom.xml` file, you might want to comment that out for the moment.

### 4. Use Maven to build and deploy your project

```bash
mvn clean deploy
```

### 5. Now you just need to commit and push your changes in project `mvn-repo`

```bash
git commit -m "Added org.openjdk.jmh"
git push
```

### 6. In you other projects, you can reference to your own Maven repo 
```xml
<repositories>
	<repository>
		<id>nealxyc-github-repo</id>
		<url>https://raw.githubusercontent.com/nealxyc/mvn-repo/master/</url>
		<releases>
	            <enabled>true</enabled>
	            <updatePolicy>daily</updatePolicy>
	        </releases>
		<snapshots>
	            <enabled>true</enabled>
	            <updatePolicy>always</updatePolicy>
	        </snapshots>
	</repository>
</repositories>
```