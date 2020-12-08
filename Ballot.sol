// SPDX-License-Identifier: MIT

pragma solidity ^0.4.0;

contract owned {
	address public owner;
 
	function owned() public {
    	owner = msg.sender;
	}
 
	modifier onlyOwner {
    	require(msg.sender == owner);
    	_;
	}
 
	function transferOwnership(address newOwner) public onlyOwner {
    	owner = newOwner;
	}
}
 
contract Ballot is owned {
  
  /* Addresses of Raspberry with LEDs */
  address public greenLED;
  address public redLED;
  /* Address of Raspberry connected to Sensor */
  address public startSENSOR;
  
  /* Address of Raspberry connected to Sensor */
  uint256 public fee;
  
  /* mapping of participants' addresses */
  uint _participantsNUMBER;
  mapping (uint => address) private participantLIST;
  struct Bet {
    uint howMuch;
    address onWhat;
  }
  mapping(address => Bet) participants;
  
  /*************************************************************
             OMIT ... constructor and admin functions
  **************************************************************/

  /*
  FUNCTION
  - accepts a Bet when the sender is a LED
  - records the participant and its Bet
  - emits a GetBet message on blockchain log
  */
  event GetBet(uint participantsNUMBER_untilNow, uint256 balance_untilNow);
  
  function getBet(address _participant, address _onWhat) public payable {
    require(msg.sender == greenLED || msg.sender == redLED);
    
    participantLIST[_participantsNUMBER] = _participant;
 
    participants[_participant].howMuch = msg.value;
    participants[_participant].onWhat = _onWhat;
 
    _participantsNUMBER++;
    
    emit GetBet(_participantsNUMBER, address(this).balance);
  }

  /*
  FUNCTION
  - accepts the call when the sender is the SENSOR
  - holds a fee to keep running
  - divides the budget into fair shares and redistributes it
  - emits a Redistribute message on blockchain log
  */
  event Redistribute(address _winner);
  
  function redistribute(uint _numberDrawn) public {
    require(msg.sender == startSENSOR);
    
    address winnerLED = redLED;
    if (_numberDrawn == 0) winnerLED = greenLED;
    
    owner.transfer(address(this).balance * fee / 100);
    
    uint shareTot = 0;
    uint shareInt = 0;
    uint shareDec = 0;
     for(uint i = 0 ; i<_participantsNUMBER; i++) {
      if (participants[participantLIST[i]].onWhat == winnerLED)
        shareTot += participants[participantLIST[i]].howMuch;
    }
    if (shareTot > 0) {
        shareInt = address(this).balance / shareTot;
        shareDec = address(this).balance % shareTot;
    }
    for(i = 0 ; i<_participantsNUMBER; i++) {
      if (participants[participantLIST[i]].onWhat == winnerLED) {
        uint share = participants[participantLIST[i]].howMuch * shareInt;
        share += participants[participantLIST[i]].howMuch * shareDec / shareTot;
        participantLIST[i].transfer( share );
      }
    }
    _participantsNUMBER = 0;
    
    emit Redistribute(winnerLED);
  }
}
 