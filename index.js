String.prototype.clr = function (hexColor) { return `<font color='#${hexColor}'>${this}</font>` };

const	fs = require('fs'),
		path = require('path');

module.exports = function field_boss_time(mod) {
	
	const command = mod.command;
	
	let bams = require('./saved.json'),
		changed = false,
		notifier = mod.manager.isLoaded('notifier') ? ( mod.require ? mod.require.notifier : require('tera-notifier')(mod) ) : false;

				
	function getBamName(id)
	{
		switch (id)
		{
			case "@creature:26#5001": return "Ortan";
			case "@creature:51#4001": return "Cerrus";
			case "@creature:39#501": return "Hazard";
			default: return "John Cena";
		}
	}
	
	function addZero(i) 
	{
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	}
	
	function saveJson(obj)
	{
		if (Object.keys(obj).length && changed)
		{
			console.log('Saving field-boss times to the save file...');
			try
			{
				fs.writeFileSync(path.join(__dirname,'./saved.json'), JSON.stringify(obj, null, "\t"));
				changed = false;
			}
			catch (err)
			{
				console.log(err);
				return false;
			}
		}
	}
	
	this.destructor = function() {
		saveJson(bams);
	}
	
	mod.hook('S_SYSTEM_MESSAGE', 1, event => {		
		const msg = mod.parseSystemMessage(event.message);
		if(msg.id === 'SMT_FIELDBOSS_APPEAR')
		{
			//console.log(msg);
			changed = true;
			let name = getBamName(msg.tokens.npcName);
			bams[name] = "Alive".clr("32CD32");
			const displayedMsg = "Field Boss " + name.clr("56B4E9") + " appeared".clr("32CD32");
			command.message(displayedMsg);
			if(notifier) notifier.messageafk(displayedMsg);
		}
		else if(msg.id === 'SMT_FIELDBOSS_DIE_GUILD' || msg.id === 'SMT_FIELDBOSS_DIE_NOGUILD')	
		{
			//console.log(msg);
			changed = true;
			let name = getBamName(msg.tokens.npcname);
			command.message("Field Boss " + name.clr("56B4E9") + " was " + "killed".clr("DC143C") + " by " + msg.tokens.userName.clr("FDD017"));
			bams[name] = Date.now() + 5*60*60000 + (30 * 60 * 1000);
			command.message(name + ": " + makeText(bams[name]));
		}
	});
	
	function makeText(date)
	{
		if(isNaN(date))
		{
			return date;
		}
		if(date < Date.now())
		{
			return "?";
		}
		let startT = new Date(date - (60 * 60 * 1000));
		let endT = new Date(date);
		return "Respawns on " + (addZero(startT.getHours()) + ":" + addZero(startT.getMinutes())).clr("E69F00") + " - " + (addZero(endT.getHours()) + ":" + addZero(endT.getMinutes())).clr("E69F00");
	}

	command.add('bamtime', () => {
		command.message("Ortan: ".clr("56B4E9") + makeText(bams.Ortan));
		command.message("Cerrus: ".clr("56B4E9") + makeText(bams.Cerrus));
		command.message("Hazard: ".clr("56B4E9") + makeText(bams.Hazard));
	})
}
