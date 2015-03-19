-------------------------------------
TO RUN THE PROGRAM
-------------------------------------
1. Download Node.js (http://nodejs.org/)
2. Follow the installation instruction specific to your operating system.

-----THROUGH COMMAND LINE-----
	3. Locate index.js file in command line
	4. Type "node server.js"

-----THROUGH ECLIPSE IDE-----
	3. Download and install Nodeclipse plug-in through Eclipse Software Manager
	4. Right click WebServer > server.js and click Run As > Node Application on the menu that appears

5. Open Google Chrome web browser
6. Type "http://localhost:3333/" into your address bar

-------------------------------------
SET UP
-------------------------------------

There is a default bootstrapped dataset database which includes:
USER ACCOUNTS
	- mod moderator
	- user(1-17) users
Simulations
	- Test Simulation 1
	- Test Simulation 2
	- Test Simulation 3
		
* all Users have joined Test Simulation 1, but have not been sorted into countires.

-------------------------------------
LOGIN FOR MOD
-------------------------------------
1. Enter the username "mod" with the password "mod"
2. Press the "Sign in" button or press enter

-------------------------------------
LOGIN FOR USER
-------------------------------------
1. Enter the username "usern", where "n" is a number between 1-17(ie. user1), and with the password "123" 
2. Press the "Sign in" button or press enter

-------------------------------------
TO JOIN NEW ROOM
-------------------------------------

-----AFTER LOG IN-----
1. Click the "Join New Room" button
2. Pop-up box will appear with list of available rooms to join
3. Click on one of the options to join that room
4. Page will redirect to Room landing page

-----WHILE IN ROOM-----
1. Click the "Change simularion room..." dropdown menu
2. Select "Join New Room" option
3. Pop-up box will appear with list of available rooms to join
4. Click on one of the options to join that room
5. Page will redirect to Room landing page

-------------------------------------
TO SELECT EXISTING ROOM
-------------------------------------

-----AFTER LOG IN-----
1. Click the "Select Existing Room" button
2. Pop-up box will appear with list of available rooms to join
3. Click on one of the options to rejoin that room
4. Page will redirect to Room landing page

-----WHILE IN ROOM-----
1. Click the "Change simularion room..." dropdown menu
2. Pop-up box will appear with list of current rooms to rejoin
3. Click on one of the options to rejoin that room
4. Page will redirect to the new Room landing page

-------------------------------------
TO CREATE NEW ROOM
-------------------------------------

-----MUST BE LOGGED IN AS A MODERATOR-----
1. Click the "Create New Room" button
2. Page will redirect to "Create a New Simulation Room" page
3. Enter the desired Simulation name, registration deadline, start date and end date 
4. Click "Create" button
-----WARNING-----
	- Registration deadline must be before or the same date as the start date
	- The end date must be after the start date

5. On successful creation, Page will redirect to Room landing page

-------------------------------------
TO MODIFY ACCOUNT INFO
-------------------------------------

-----AFTER LOG IN-----
1. Click the "My Profile" link, located on the right of the header
2. Page will redirect to user profile page
3. Click the "Edit Profile" button
4. Page will redirect to edit user page
5. Enter desired name and email
-----TO CHANGE PASSWORD-----
	6. Enter the new desired password in the "New Password" and "Confirm Password" bar
  	   They must match, or the password will not save

7. Click "Save Changes"
8. Page will redirect to user profile page

-------------------------------------
TO VIEW USER LIST
-------------------------------------
1. Click the "User List" option on the left in the "Simulation Menu"
2. Page will redirect to user list page

-------------------------------------
TO SEE/SEND GLOBAl MESSAGES
-------------------------------------
1. Click the "Global Messages" option on the left in the "Simulation Menu"
2. Page will redirect to global message page
3. To send message, enter text in the bottom text bar, and click the "Send Message" button

-------------------------------------
TO VIEW RESOLUTIONS
-------------------------------------
1. Click the "Main Room" button located at the top right, or the Main Room Link in the left bar
2. Page will redirect to resolution page

-------------------------------------
TO ADD RESOLUTIONS
-------------------------------------
-----WARNING-----
	- To add resolution, the user must be a moderator

1. Click the "User List" option on the left in the "Administration Menu"
2. Page will redirect to add resolution page
3. Enter the desired name, resolution and clauses
-----TO ADD EXTRA CLAUSES-----
	4. Click the "Add Clause" button, and a new clause box will appear

5. Click the "Add Resolution" button
6. Page will refresh with success method

-------------------------------------
ACTIVATE A RESOLUTION FOR DEBATE
-------------------------------------

-----WARNING-----
	- To activate/deactivate a resolution, the user must be a moderator or chair
	
1. Navigate to the SIMULATION
2. Click the "Main Room" button on the top left
3. Click on the "Toggle" button next to the resolution name to activate or dectivate
	- If you activate a resolution when another is active, the current active one deactivates and 
	  the one you selected becomes active
	  
-------------------------------------
ENTER A RESOLUTION DEBATE ROOM
-------------------------------------

1. Navigate to the SIMULATION
2. Click the "Main Room" button on the top left
3. Click on the active resolution name

-------------------------------------
SUBMITING AN AMENDMENT
-------------------------------------

-----WARNING-----
	- The user must be an ambassador(delegate)
1. Go to the RESOLUTION DEBATE ROOM(see above)
2. Click the "Submit Amendment" button under the resolution description
3. Select the clause number you wish to propose change to
	-For creating new clauses, select the "New Clause" option instead of a clause number
4. Make the changes to the clause if any
5. Select what you would like done to selected clause(Edit, Remove, Add)
	-Can only Add for "New Clause"
	-Can only Edit and Remove for existing clauses
6. Returns you to the RESOLUTION DEBATE ROOM

-------------------------------------
PLACING AN AMENDMENT BE VOTED
-------------------------------------
-----WARNING-----
	- The user must be the Chair or Moderator
1. Go to the RESOLUTION DEBATE ROOM(see above)
2. Click the "Amendment Request" button under the resolution description
  This takes you to a list of submited amendments by all the countries for which each submitment you can:
  	3. Delete: by clicking the "Delete" button, it deletes the amendment submission
  	4. Add: By clicking the "Add" button, it sends the amendment to the Resolution Debate Room and starts the vote to open debate
  		on the current amendment
  		
-------------------------------------
TO VIEW ALL POSITION PAPERS
-------------------------------------
-----WARNING-----
	- The "View All Position Papers by Country" button will only appear if the user is a chair
	  or mod, or if the position paper deadline date has passed

1. Click "View All Position Papers by Country" button
2. Page will redirect to all position papers page
3. Click on the desired country's name
4. Pop-up box will appear with desired country's position paper
5. Click the "x" or hit esc to close the pop-up box

-----------------------------------------
TO VIEW/EDIT USER COUNTRY POSITION PAPER
-----------------------------------------
-----WARNING-----
	- The "Add/Edit Your Country's Position Paper" button will only appear if the user apart of a country

1. Click the "Add/Edit Your Country's Position Paper" button
2. Page will redirect add/edit position paper page
-----IF COUNTRY AMBASSADOR-----
	3. Enter the new country position into the text box
	4. Press "Save Changes" button 

-----IF COUNTRY MEMBER----- 
	3. Country position will appear in text box, in a read-only state

-------------------------------------
TO EDIT SIMULATION
-------------------------------------
-----MUST BE LOGGED IN AS A MODERATOR----- 
	
1. Click the "Edit Room" button under the ADMINISTRATION MENU on the left.
2. Enter the data which you wish to change.
------INSTANT COUNTRY SORT -----
	3.Selecting instant auto sort will sort all users who joined the simulation immediately upon saving the changes
-----REGISTRATION COUNTRY SORT----
	4. Selecting auto sort on registration date will sort all users who joined the simulation when the current date becomes registration date
-----MANUAL COUNTRY SORT ----
	5. Selecting manual sort make visible extra options to manually sort users.
		I. Select a country in the first dropdown box,
		II. Next dropdown box shows all the users currently in that country and selecting one will allow you to remove the user from the country.
		III. The final dropdown box shows all the users not in a country and by selecting one will allow you to add them to the current country.

6. Click the "Save Changes" button

-------------------------------------
TO EDIT COUNTRY DELEGATES
-------------------------------------

1. Navigate to the EDIT SIMULATION page (see above)
2. Click the "Select/Edit Ambassadors" button.
2. Select the users under each country dropdown you wish to be the countries ambassadors
3. Click the "Save" button

-------------------------------------
TO ADD/EDIT A COUNTRY'S DIRECTIVE
-------------------------------------

1. Navigate to the EDIT SIMULATION page (see above)
2. Click the "Set Directives" button
3. Select country from dropdown box
4. Enter country's directive
5. Click the "Save" button

-------------------------------------
GENERAL VOTING
-------------------------------------

1. Navigate to the EDIT SIMULATION page (see above)
2. Click the "Set Directives" button
3. Select country from dropdown box
4. Enter country's directive
5. Click the "Save" button
